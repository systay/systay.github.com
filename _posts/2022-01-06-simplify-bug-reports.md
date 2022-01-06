---
layout: blog
title: Automatically simplifying bug reports
---

# {{ page.title }}

When we get bugs reported on the planner, it's often not simple and straight forward queries that created the problem.
We have so many users that these queries are already well-used and would have been reported and fixed a long time ago.

A surprisingly big amount of time is spent by us developers just trying to understand what the query is trying to do.

Another source of input to us developers are queries that have been randomly created and are failing some test.
We do a lot of automated testing by fuzzing queries, and when these tests find problems, we need to understand what the query is doing in order to be able to work on fixing the issue.

Both these activities could benefit from the kind of "shrinking" used by Haskell's QuickCheck.
Simply put, shrinking means making the test inputs as small and simple as possible, while still getting the same error.

Such a shrunken query would be much easier for us developers to work on.

So, over the holidays, since my kids were away, I spent some time writing a query shrinker for Vitess.

It's always easier for me to explain using an example. 
Here is a query that our planner is not happy with.

```sql
select
       lower(unsharded.first_name)+lower(unsharded.last_name), 
       user.id, 
       count(*) 
from user 
    join user_extra on user.id = user_extra.id 
    join unsharded 
where unsharded.foo > 42 and 
      user.region = 'TX' and 
      user_extra.something = 'other' 
order by user.age
```

It fails with:

```
In aggregated query without GROUP BY, expression of SELECT list contains nonaggregated column 'lower(unsharded.first_name) + lower(unsharded.last_name)'; 
this is incompatible with sql_mode=only_full_group_by
```

Vitess requires `sql_mode` to have `only_full_group_by` set. 
The actual error is not really interesting - we have a query that fails with some error, and we are interested in finding a simpler version of the query that still has the same issue.

If we wanted to understand the problem, a simpler query would be helpful, 

We can stick our query into `TestSimplifyBuggyQuery` and check what the new shrinker would do.

The log output looks something like this:

```
1: removed table `user`
2: replaced star with literal
3: simplified expression: lower(unsharded.first_name) + lower(unsharded.last_name) -> lower(unsharded.first_name)
4: simplified expression: lower(unsharded.first_name) -> unsharded.first_name
5: simplified expression: unsharded.first_name -> 0
6: removed table unsharded
7: removed expression: user_extra.something = 'other'
```

The first simplification that happens is that we try to rip out a table and all uses of it.
So the line `1` not only removes `user` from the FROM clause, but all the expressions in SELECT WHERE and ORDER BY that uses `user`.

The simplifier tried but was not successful in removing either of the remaining two tables - if either is removed, the error goes away or changes.

The query now looks like:
```sql
select
       lower(unsharded.first_name)+lower(unsharded.last_name), 
       count(*) 
from user_extra 
    join unsharded 
where unsharded.foo > 42 and 
      user_extra.something = 'other' 
```

Already a much simpler query, but there is still more we can do.

Next up, line `2` changes `count(*)` to `count(0)`
I think line 3-5 speak for them self, which leaves us with this query:

```sql
select
       0, 
       count(0) 
from user_extra 
    join unsharded 
where unsharded.foo > 42 and 
      user_extra.something = 'other' 
```

Given this query, the simplifier tries removing tables again, and this time we can get rid of the `unsharded` table altogether.

Finally, we can also remove the predicate in the WHERE clause, leaving us with this query:

```sql
select 0, count(0) from user_extra
```

The way I think of the shrinker is that it works with the AST, trimming out leaves from it.
It tries removing this leaf here, and that one there, and after every change, it runs the planner again and makes sure that the same error still comes back.

Once nothing can be removed, the simplifier is done.