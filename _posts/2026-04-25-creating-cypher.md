---
layout: blog
title: Creating Cypher
summary: How a Friday side-project at Neo4j turned into a query language
---

# {{ page.title }}

I started working at a database company in 2010. Up to that point, I had worked extensively with databases during my whole career, but always from the outside. I'd worked as a DBA and as a developer focused on the data layer. During this time, I learned to read execution plans very well, and built up enough experience that I had a bit of intuition around this stuff. To me it was magical - how something could turn my SQL query into an optimised execution plan blew me away.

I remember many late evenings poring over Microsoft SQL Server's horizontal query plans and their documentation listing [every single operator possible](https://learn.microsoft.com/en-us/sql/relational-databases/showplan-logical-and-physical-operators-reference?view=sql-server-ver17).

Since I dropped out of higher education, I had no academic understanding of query planning. I treated the planner like a black box and learned by poking at it until it behaved differently. It was very educational, and so much fun.

Back to 2010 - I was hired by Neo4j. It was unclear what I would work on. When I joined, the way to interact with Neo4j was by using it as a Java library. You would build a traversal description using Java objects, and the traversal then gave you a visitor pattern where you could visit nodes along the way and at the endpoints. Here you could control the traversal - prune paths etc, but also do things such as aggregate data. To me, coming from SQL, this was very weird. It felt wrong. “This isn’t a database,” I remember thinking. “It’s a toolkit.”

Back then, we had Fridays free to do whatever we wanted, and I used this time to play around with better ways of interacting with Neo4j. I made multiple attempts - if you look at my oldest repositories on GitHub you'll find some of them, but none of them were very good. No one at Neo4j cared much about these first clumsy mistakes. I remember talking with Emil and others at the company about the fact that we needed a query language, but there was a strong belief that the performance benefits of being an in-process Java library could never be beaten by a parsed query language.

That changed when I started thinking about how SQL could be bent to work for graphs. Most of it translated surprisingly well—except for FROM. That’s where the difference between relational and graph models became painfully obvious.

We already described traversals on whiteboards using circles and arrows. When we needed to share them, we used simple ASCII art.

At some point, I tried putting that ASCII directly into a query syntax.

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

Just to make it more interesting, I also chose to do it in a language (Scala) that no one in the company was comfortable with, and that I had never worked in before. In retrospect, this was a terrible idea. My bosses should have stopped me.

I hacked away, and finally we had something that could accept a lot of different queries and execute them. It was full of bugs, very slow, and fragile as a house of cards, but it worked!

Anyway. After some time, the team started to grow, and Stefan Plantikow and Tobias Lindaaker started working more closely with me on the language, and Stefan in particular also on the code. We started working with Andrey Gubichev, at that time a PhD student at the Technical University of Munich, who told us which papers to read, and critiqued our code. I didn't have the foundation to understand these papers at all, so he would patiently explain enough so we could make our code better.

Two distinct memories stand out. During a trip to Argentina, my colleague Alex Averbuch, who was much more familiar with the academic side, suggested a handful or two of papers I would benefit from reading. I remember sitting in the shade in Cordoba, Argentina, trying to understand these papers, and re-reading the same page over and over again. I was missing whole fields - statistics, relational algebra, boolean algebra I knew existed but not much more, parsing, semantic analysis - the list goes on and on.

The other memory is feeling like I had found a cheat code. Until this time, I had just used my big wet brain and come up with a solution when I needed it. I would need to think carefully, draw diagrams and reason in front of whiteboards with colleagues. Here were thousands of papers produced over decades on the subjects I needed answers to, just there waiting for me to read them and apply them when I needed them. Our paper reading sessions were great - having to prepare presentations for my colleagues really helped me grok difficult things.

Soon the team around Cypher grew. The language started living its own life and being developed by a committee. This work was really interesting, but at times quite stressful for me. At the same time, the implementation team kept growing, and I got more and more leadership responsibilities. I was very grateful when Craig Taverner took over leadership of the Cypher implementation team, and Alistair Green took over the Cypher language work. I finally got to focus on what I always felt was most interesting - the query planner.

Since then, Cypher has become the main interaction point with Neo4j databases, and it formed an important seed for ISO/IEC 39075: Graph Query Language, an extension of SQL that incorporates many Cypherisms.

Creating Cypher wasn’t the goal. It was the price I had to pay to work on a query planner. In hindsight, that seems obvious. At the time, it didn’t. It just felt like the next problem I had to solve.

What surprised me the most wasn’t that Cypher shipped.

It was that it didn’t stay ours.

Over time, people started implementing Cypher outside of Neo4j. Different databases, research systems, experimental runtimes — all taking the same ideas and building their own versions. At some point I started keeping a list of these implementations, partly out of curiosity, partly because it felt surreal that something that started as a Friday experiment had become something others wanted to recreate.

I never set out to design a language.
But once it existed, it stopped being mine.
