---
layout: blog
title: Automatically simplifying bug reports
---

# {{ page.title }}

When we get bugs reported on the planner, it's often not simple and straight forward queries that created the problem.
We have so many users that commonly used patterns in queries are already well-used and would have been reported and fixed a long time ago.

Another source of buggy queries are ones that have been randomly created by our testing infrastructure.
We do a lot of automated testing by fuzzing queries, and when these tests find problems, it's often weird looking queries that are using a weird combination of patterns.

So, given that bug reports often involve complex queries, a surprisingly big amount of time is spent by us developers just trying to understand what the query is trying to do.

### QuickCheck in Haskell

In Haskell, a well-used test system is QuickCheck.
It produces random input and asserts that it follows rules described by the test.
When a rule is broken, it does this marvelous thing called shrinking.
Shrinking is taking an input that is known to be failing, and make it smaller and simpler, while it's still failing.

This means that when you find a problem, you get to focus on the already isolated input that makes it fail.

### Shrinking in Vitess

Both for bug reports, and for the failures found using fuzzing, we would love to have a query shrinker that can simplify queries that are failing.

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
So the line `1` not only removes `user` from the FROM clause, but all the expressions in SELECT WHERE and ORDER BY that use the `user` table.

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

Next up, line `2` changes `count(*)` to `count(0)`.
Line 3-5, the shrinker simplifies expressions.
The first simplification is always to simply remove the expression, but if that is too much and the error goes away, the expression can be broken down into it's sub expressions.
It tries all different combination of sub expressions, and just keeps the first one that still fails with the same error.
So, an expressions like `a + b`, the shrinker would try replacing it with `a` first and then with `b`, and if either is still producing the same error, that is what we keep.
In line 3, it replaced the `+` operator with the left argument, and then in line 4 the function call is replaced with the argument to the function.
And finally in line 5, it found that a column access can be simplified by using a literal instead.
Now we have a query that looks like:

```sql
select
       0, 
       count(0) 
from user_extra 
    join unsharded 
where unsharded.foo > 42 and 
      user_extra.something = 'other' 
```

After every simplification, the simplifier starts again from the top, and tries to remove entire tables.
One line 6, we can see that once the `SELECT` expressions have been simplified, we can now rip out `unsharded` altogether.

Finally, one line 7, we can also remove the predicate in the WHERE clause, leaving us with this query:

```sql
select 0, count(0) from user_extra
```

This is a much simpler query that the one we started with, but it is still producing the same error.

The way I think of the shrinker is that it works with the abstract syntax tree, trimming out leaves from it.
It tries removing this leaf here, and that one there, and after every change, it runs the planner again and makes sure that the same error still comes back.

Once nothing can be removed, the simplifier is done.

### Parting words

There are plenty of papers out there that show algorithms for how to do simplification efficiently.
After reading a couple of them, in the end, I didn't actually use any of the algorithms.

The current implementation is much more brute force, and that is fine given the amount of queries and the size of the AST we are working with.
Even if it takes a couple of seconds for my CPU to brute force it, it's going to be much faster and more thorough than I would be.