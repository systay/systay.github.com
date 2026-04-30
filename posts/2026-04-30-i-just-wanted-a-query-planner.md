---
layout: blog
title: I Just Wanted a Query Planner
summary: How a Friday side-project at Neo4j turned into a query language
---

I started working at a database company in 2010. Up to that point, I had worked extensively with databases throughout my career, but always from the outside. I'd worked as a DBA and as a developer focused on the data layer. During this time, I learned to read execution plans very well, and built up enough experience that I had a bit of intuition around this stuff. To me, it was magical. How something could turn my SQL query into an optimised execution plan blew me away.

I remember many late evenings poring over Microsoft SQL Server's horizontal query plans and their documentation listing [every single operator possible](https://learn.microsoft.com/en-us/sql/relational-databases/showplan-logical-and-physical-operators-reference?view=sql-server-ver17).

Since I dropped out of higher education, I had no academic understanding of query planning. I treated the planner like a black box and learned by poking at it until it behaved differently. It was very educational, and so much fun.

Back to 2010 — I was hired by Neo4j. It was unclear what I would work on. When I joined, the way to interact with Neo4j was by using it as a Java library. You would build a traversal description using Java objects, and the traversal then gave you a visitor pattern where you could inspect nodes along the way and at the endpoints. Here you could control the traversal - prune paths etc., but also do things such as aggregate data. To me, coming from SQL, this was very weird. It felt wrong. “This isn’t a database,” I remember thinking. “It’s a toolkit.”

Back then, we had Fridays free to do whatever we wanted, and I used this time to play around with better ways of interacting with Neo4j. I made multiple attempts, if you look at my oldest repositories on GitHub you will find some of them, but none of them were very good. No one at Neo4j cared much about these first clumsy mistakes. I remember talking with Johan, the CTO, and others at the company about the fact that we needed a query language, but there was a strong belief that the performance benefits of being an in-process Java library could never be beaten by a parsed query language. Maybe we should do it, but not now, we have more important things to work on.

I couldn’t quite shake the idea of a query language. Eventually, I started wondering: what if SQL itself could be bent to work for graphs? Most of it translated surprisingly well, except for FROM. That’s where the difference between relational and graph models became painfully obvious.

In both SQL and Cypher, the query forms a graph. In SQL, you have tables, and joins form “virtual” relationships through value comparisons. These relationships are not persisted to disk in the same way that relationships are stored in a graph database. Academic papers on relational databases talk a lot about the query graph.

We wanted the query graph to be easier to understand. In SQL, it’s possible to express variable-length relationships, but it’s very hard to read. In this new graph language, it should be easy to see and understand the shape of the query.

We already described traversals on whiteboards using circles and arrows. When we needed to share them in documents, we used simple ASCII art.

As we toyed with how to express complex patterns, Mattias Finné and I started sending small made-up queries to each other over email to test the syntax.

At some point, we converged on using that ASCII art directly in a query syntax, and quickly we realised we were on to something really neat.

That was the beginning of Cypher.

I've been able to recreate the original Cypher repo; you can find it here: https://github.com/systay/cypher-original

You can see the first example of a query there:

```
FROM NODE(1) -KNOWS-> x
SELECT x
```

Cypher syntax changed a lot before it became what it is today. Emil was never very directly involved in Cypher, but he was the one who decided we needed parentheses around nodes. Thanks Emil, that made a lot of sense in hindsight.

---

This experiment took off, and pretty quickly got the attention of Emil and others at Neo4j. Not long after, my little Friday (and weekends) project was shipped alongside the rest of Neo4j as an experimental jar one could use.

So, now we had a language. But we still needed code that could turn strings into executable things in Neo4j, and I was very, very lost about how that was done.

I didn't really know anything about this stuff. I barely knew what a parser was. That didn’t stop me. I started coding. I knew how to read execution plans; how hard can it really be to write them? I was painfully out of my depth, and everything was new to me.

Just to make it more interesting, I also chose to do it in a language (Scala) that no one in the company was comfortable with, and that I had never worked in before. I was in my functional programming phase. I wanted to use Clojure, but it was too weird for the Java devs at Neo4j, so I picked Scala on the recommendation of Andreas Kolleger. In retrospect, this was a terrible idea. My bosses should have stopped me. Today Neo4j has hundreds of thousands of lines of Scala code, because of a whim I had back then. 

I hacked away, and finally we had something that could accept a lot of different queries and execute them. I was very focused on getting this to work, and I think I didn't really understand the size of the undertaking, which helped. Had I understood the many things I had to get right, maybe I wouldn't have started on it in the first place. But after months of work, we had something that kind of worked. It was full of bugs, very slow, and fragile as a house of cards, but it returned data!

Anyway. After some time, the team started to grow, and Stefan Plantikow and Tobias Lindaaker started working more closely with me on the language, and Stefan in particular also on the code. We started working with Andrey Gubichev, at that time a PhD student at the Technical University of Munich, who told us which papers to read, and critiqued our code. I didn't have the foundation to understand these papers at all, so he would patiently explain enough so we could make our code better.

Two distinct memories stand out. During a trip to Argentina, my colleague Alex Averbuch, who was much more familiar with the academic side, suggested a handful of papers I should read. I remember sitting in the shade in Córdoba, trying to understand them, re-reading the same page over and over again.

I was missing entire fields—statistics, relational algebra, parsing, semantic analysis. I knew some of these existed, but not much more. It felt like I had wandered into a conversation where everyone else spoke a language I barely understood.

The other memory is feeling like I had found a cheat code. Until then, I had mostly relied on my own thinking—drawing diagrams, reasoning things through on whiteboards with colleagues. Now there were thousands of papers, produced over decades, covering exactly the problems I was trying to solve. They were just there, waiting to be read and applied.

Our paper reading sessions were great. Having to prepare presentations for my colleagues forced me to really understand the material, and helped me grok things I otherwise wouldn’t have.

Soon the team around Cypher grew. The language started living its own life and being developed by a committee. This work was really interesting, but at times quite stressful for me. At the same time, the implementation team kept growing, and I got more and more leadership responsibilities. I was very grateful when Craig Taverner took over leadership of the Cypher implementation team, and Alistair Green took over the Cypher language work. I finally got to focus on what I always felt was most interesting - the query planner.

Since then, Cypher has become the main interaction point with Neo4j databases, and it formed an important seed for ISO/IEC 39075: Graph Query Language, an extension of SQL that incorporates many Cypherisms.

Creating Cypher wasn’t the goal. It was the price I had to pay to work on a query planner. In hindsight, that seems obvious. At the time, it didn’t. It just felt like the next problem I had to solve.

What surprised me the most wasn’t that Cypher shipped, it was that it didn’t stay ours. Over time, people started implementing Cypher outside of Neo4j. Different databases, research systems, experimental runtimes — all taking the same ideas and building their own versions. It felt surreal that something that started as a Friday experiment had become something others wanted to recreate.

I never set out to design a language.
But once it existed, it stopped being mine.