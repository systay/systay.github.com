---
layout: blog
title: Life of a Vitess Query - Parsing and rewriting
summary: What happens when you issue a query to a vtgate?
---

# {{ page.title }}

SQL is a declarative language, which means you tell it what you want done, and the database engine figures out how to do it for you.
When I started with databases, this seemed an almost magical process to me, and I have been fascinated by it for decades now.

As my 20% project, I have been working on a new query planner for Vitess, and I wanted to share what the design looks like and what the important characters in this story are.
The project is being tracked here: https://github.com/vitessio/vitess/issues/7280

### Step 1 - Parsing

When a query comes to the vtgate executor, it will first parse the query.
The input is your query string, and the output is a struct called the AST - abstract syntax tree. 
Like the name implies, this is a tree shaped struct that represents the interesting parts of query.

Example query:
```sql
SELECT t.col + s.col
FROM t 
  JOIN s ON t.id = s.t_id
WHERE (t.foo = 42) 
  AND (s.bar = 'dud')
```

This query becomes a tree that, simplified, looks something like this:

```
  SELECT
    ├── Exprs
    │   └── +
    │       ├── t.col
    │       └── s.col
    ├── FROM
    │   └── JOIN
    │       ├── t
    │       ├── s
    │       └── ON
    │           └── =
    │               ├── t.id
    │               └── s.t_id
    └── WHERE
        └── AND
            ├── =
            │   ├── t.foo
            │   └── 42
            └── =
                ├── s.bar
                └── "dud"
```

We do this because working with strings is slow and clunky, compared to using type safe datastructures like this.
Instead of string matching, we can check the fields and types in structs, in order to understand what the user is asking for.
It also removes lots of unnecessary details. 
Parentheses, for example, are only needed because the query comes in as a one-dimensional string.
In the tree, the grouping and precedence of expressions is clearly visible in the structure of the tree, and so parenthesis do not exist in the AST.
When we need to turn the AST back into a string, we can figure out where we need to inject parens.

I'm not going to go into details about our parsing or AST. 
It's fast, used by lots of other projects, and built using yacc.

### Step 2 - AST rewriting 

Before passing on the AST, we rewrite it a little. 
We do this for three reasons: 

1. We want queries to share the same plan when possible, so we remove literals. 

    `SELECT 42` -> `SELECT :_vtlit1`

    If we later encounter `SELECT 5`, we can use the cached plan.

2. To minimize the work the planner needs to do, we normalize the AST, so the planner doesn't have to understand two equivalent ways of expressing the same thing.

    An example of this is that we make sure that columns are on the left-hand side of equality comparisons. 

    `42 = t.col` => `t.col = 42`

3. A very important part of what Vitess does is to create an illusion for the user.

    It's the illusion of a dedicated connection to a single database, when in reality, Vitess will do connection pooling for you, and spread out your query to sometimes hundreds of MySQL instances.
   To create the illusion, we rewrite away variables, both system variables and user defined variables, and lots of function calls.
   We also change queries against the information_schema to use the table and database names that are really used in MySQL.