---
layout: blog
title: Life of a Vitess Query - Semantic Analysis
summary: What happens when you issue a query to a vtgate?
---

# {{ page.title }}

(This is a post in a series. You should start here: [Parsing and Rewriting](/blog/2021/02/03/life-of-a-query-1))

By now we have a well formed tree structure representing the query the user sent. Next step is called semantic analysis.


I'll use the following query to illustrate how it's done.

```sql
SELECT
    tbl.col,
    ( SELECT count(tbl.col)
      FROM otherTable as tbl)
FROM
    tbl
```

As a tree:

```
   SELECT (S1)
    ├── Exprs
    │   ├── tbl.col
    │   └── SELECT (S2)
    │       ├── Exprs
    │       │   └── COUNT
    │       │       └── tbl.col
    │       └── FROM
    │           └── otherTable as tbl
    └── FROM
        └── tbl
```


The main problem we are trying to solve - make it easy for the planner to know which table is meant when it encounters `tbl.col`.

We start by figuring out which scopes exist, and which tables exist in each scope.

Given this information, we can look at column expressions and resolve which tables are being referenced.

Let's go over what this would look like for this query. 

We start traversing the tree at the root, **S1**. Since this is a SELECT struct, we push a new scope on to the scope stack, and visit the FROM clause next.

The scope stack, after visiting **S1** and its FROM:
```
(tbl)
```

Next we visit the SELECT expressions of **S1**. When we visit the first expression, we take note of the current scope, and move on.
Now we know which scope this expression lives in and what tables are available to it.

Next, we'll visit the subquery that contains **S2**. When encountering **S2**, we push another scope on the stack and add the tables **S2** to this new scope.

The scope stack, after visiting **S2** and its FROM:

```
(otherTable as tbl)
(tbl)
```

When visiting the expressions of **S2**, we note the current scope for the expressions. 

There is nothing left of **S2** to visit, so we exit the sub query. When coming back up from **S2**, we pop the top-most scope, and we are ready to do the binding process.

Binding is visiting all the column expressions, and figuring out, given the scoping information, which is the table named `tbl` the is being referenced. For some column expressions, if the user has not provided a qualifier, we need to look up column information for all available tables and check if we can uniquely identify which one the user means. This information is persisted in the semantic table, which is the output of this process.

To do this as fast as possible, we do this in a single tree traversal, not in to separate steps. This way, we don't have to remember scope information per expression - we just use the current scope stack, looking down the stack until we find the table. 

Also, instead of using strings to reference the dependencies, we use bitmasks, where each table is a bit in an uint64 value.
At the end of the semantic processing, we have the dependency information we need in for all expressions in the query.

