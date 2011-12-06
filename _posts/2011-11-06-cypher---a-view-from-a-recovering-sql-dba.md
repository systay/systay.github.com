---
layout: blog
title: Cypher - A view from a recovering SQL DBA
summary: Comparing the SQL modell to Cypher
---

# {{ page.title }}

---------------------------------------
*An SQL query walks into a bar and sees two tables.*  
*He walks up to them and asks 'Can I join you?'*

*An SQL query walks into a NOSQL bar, and finds no tables.*  
*So he leaves.*

---------------------------------------

For many years, I worked with SQL databases. I got to know the relational model and various SQL implementations very well, but then the world changed with the advent of NOSQL, and I changed too when I became heavily involved with Neo4j. 

I understand that changing from the familiar SQL to the unfamiliar NOSQL query languages is hard: no schemas, JSON all over the place, and no joins? But I've made it through the learning curve and so can you. This guide is all about people like us - people who understand SQL. We can use that prior knowledge to quickly get going with Cypher and start exploring Neo4j.

# START

SQL starts with the result you want - we SELECT what we want and then declare how to source it. In Cypher, the START clause is quite a different concept which specifies starting points in the graph from which the query will execute.

From a SQL point of view, the identifiers in a START are like table names that point to a set of nodes or relationships. The set can be listed literally, come via parameters, or as I show in the following example, be defined by an index look-up. 

So in fact rather than being SELECT-like, the START clause is somewhere between the FROM and the WHERE clause in SQL. 

## SQL
    SELECT *
    FROM  Person
    WHERE firstName = "Anakin"

## Cypher
    START anakin=node:persons(firstName = "Anakin")
    RETURN anakin


Cypher allows multiple start points. This should not be strange from a SQL perspective - every table in the FROM clause is another start point. 

# MATCH

Unlike SQL which operates on sets, Cypher predominantly works on subgraphs. The relational equivalent is the current set of tuples being evaluated during a SELECT query.

The shape of the subgraph is specified in the MATCH clause. The MATCH clause is analogous to the JOIN in SQL. A normal a-->b relationship is an inner join between nodes a and b - both sides have to have at least one match, or nothing is returned. 

A simple example, where we find all nodes that are connected to node with id 101, through an incoming relationship.

## SQL
    SELECT bar.*
    FROM foo 
    JOIN bar ON foo.id = bar.foo_id
    WHERE foo.id = 101

## Cypher
    START foo=node(101)
    MATCH foo-->bar
    RETURN bar


There is no join table here, but if one is necessary writing the pattern relationship like so: -[r]-> will introduce (the equivalent of) a join table named r. In reality this is a named relationship in Cypher, so we're saying "join foo to bar via r."

## SQL
    SELECT bar.*, r.*
    FROM foo 
      JOIN foo_bar ON foo.id = foo_bar.foo_id 
      JOIN bar ON foo_bar.bar_id = bar.id
    WHERE foo.id = 1

![Legend](http://i.imgur.com/Qxdmr.png "Legend")     
![Legend](http://i.imgur.com/KOzvV.png "SQL Query")     

## Cypher
    START foo=node(1)
    MATCH foo-[foo_bar]->bar
    RETURN bar, foo_bar

![Legend](http://i.imgur.com/pSVGj.png "Cypher query")     

An outer join is just as easy. Add a question mark -[?:KNOWS]-> and it's an optional relationship between nodes - the outer join of Cypher.

Whether it's a left outer join, or a right outer join is defined by which side of the pattern has a starting point. This first example is a left outer join, because the bound node is on the left side:

## SQL
    SELECT bar.*
    FROM foo 
    LEFT JOIN bar ON foo.id = bar.foo_id
    WHERE foo.id = 1

## Cypher
    START foo=node(1)
    MATCH foo-[?]->bar
    RETURN bar

If the right side is has the start point, it is a right outer join. And if both sides have starting points, it's a full outer join, like this:

## SQL
    SELECT bar.*
    FROM foo 
      FULL OUTER JOIN bar ON foo.id = bar.foo_id
    WHERE foo.id = 1 and bar.id = 2

## Cypher
    START foo=node(1), bar=node(2)
    MATCH foo-[r?]->bar
    RETURN r



Relationships in Neo4j are first class citizens - it's like the SQL tables are pre-joined with each other. So, naturally, Cypher was designed to be able to handle highly connected data easily. 

One such domain is tree structures - anyone that has tried storing tree structures in SQL knows that you have to work hard to get around the limitations of the relational model. There are even books on the subject.

To find all the groups and sub-groups that Anakin belongs to,  this query is enough in Cypher:

## Cypher
    START user=node:person(name="Anakin")
    MATCH group<-[:BELONGS_TO*]-user
    RETURN group

The * after the relationship type means that there can be multiple hops across BELONGS_TO relationships between group and user. Some SQL dialects have recursive abilities, that allow the expression of queries like this, but personally I've always had a hard time wrapping my head around those. Expressing something like this in SQL is hugely impractical if not practically impossible.

# WHERE

This is the easiest thing to understand - it's the same animal in both languages. It filters out result sets/subgraphs. Not all predicates have a equivalent in the other language, but the concept is the same.

## SQL
    SELECT person.*
    FROM person
    WHERE person.age >35 OR person.hair = "blonde"

## Cypher
    START person = node:persons("name:*")
    WHERE person.age >35 OR person.hair = "blonde"
    RETURN person

# RETURN

This is SQL's SELECT. We just put it in the end because it felt better to have it there - you do a lot of matching and filtering, and finally, you return something.

Aggregate queries work just like they do in SQL, apart from the fact that there is no explicit GROUP BY clause. Everything in the return clause that is not an aggregate function will be used as the grouping columns.

## SQL
    SELECT person.name, count(*)
    FROM Person
    GROUP BY person.name

## Cypher
    START person=node:persons("name:*")
    MATCH person-->friend
    RETURN person.name, count(*)
    ORDER BY

Order by is the same in both languages - ORDER BY expression ASC/DESC. Nothing weird here.

# Use the right tool

No database is the silver bullet for data persistence and querying. That is what NOSQL means to us - look at your data and what you want to do with it, and then choose the appropriate tool for the job. Neo4j and Cypher are custom built for graph problems. Compare the shortest path query here with what it looks like in Cypher:

## Cypher
    START lucy=node(1000), kevin=node(759)
    MATCH p = shortestPath( lucy-[*]-kevin )
    RETURN p

# Wrap up

The performance characteristics are radically different when you move from a relational data store to Neo4j. Things that a SQL developer might fear because the performance bug has bitten there before, might not at all be expensive in a graph database. 

Relational databases have a different underlying model than graph databases, and so the query languages for them naturally have different design goals. Cypher was designed to make querying of complex, heavily interconnected data as natural as possible. It should not only make the querying possible, but we aim to have a query language that helps you think about your data query.

If you know SQL well, you will quickly be productive with Cypher.