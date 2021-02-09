---
layout: blog
title: Life of a Vitess Query - Query Graph
summary: What happens when you issue a query to a vtgate?
---

# {{ page.title }}

(This is a post in a series. You should start here: [Parsing and Rewriting](/blog/2021/02/03/life-of-a-query-1))

The process of plan building is all about evaluating in which order to execute joins find the cheapest join combination we can use. 

So, we need a better data structure than a tree to represent this, and the title of this post has probably spoiled which one that is.

A graph is perfect for this problem.  
Tables are the nodes, and the join predicates are the relationships between them.

As a struct, what I ended up using looks something like this:

```go
type queryGraph struct {
  tables     []*queryTable
  predicates map[semantics.TableSet][]sqlparser.Expr
}

// queryTable is a single FROM table, including all predicates particular to this table
type queryTable struct {
  tableID    semantics.TableSet
  alias      *sqlparser.AliasedTableExpr
  table      sqlparser.TableName
  predicates []sqlparser.Expr
}
```

Sub queries complicate things, but I'm keeping it simple in these posts and not handling them.

I think of the query graph as the `FROM` and the `WHERE` of the query. When doing join ordering, this is actually the only information we need - we don't need anything else from the AST

Let's look at those structs a little more. 
A `queryTable` struct contains information about a table, and all predicates that only depend on this particular single table.

To find join predicates between two tables, we just do a bit OR between the two TableSet, and use that as the key to search for join predicates between the two tables.

The common solution would probably have been an adjacency matrix, but using a `map[semantics.TableSet][]sqlparser.Expr` makes it possible to deal with N-way joins, something that would mean extra logic using a matrix.

Just to recap - we start with a query as a string, which is parsed into an AST, that is distilled into a query graph.

This is what we need to do join ordering.