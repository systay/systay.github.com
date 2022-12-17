<div>Hi!

Welcome to this little collection of my writings. I write mostly about query optimizers.
Find more of my online stuff here:

<ul>
  <li><a href="https://github.com/systay">Github</a> </li>
  <li><a href="https://twitter.com/andres_taylor">Twitter</a></li>
  <li><a rel="me" href="https://fosstodon.org/@systay">Mastodon</a></li>	
</ul>  


<div id="posts">
	<h2>Posts</h2>
		{% for post in site.posts %}
		<div class="post">
			<div>
				<span class="post_date">{{ post.date | date_to_string }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a>
			</div>
			<div class="post_summary">{{ post.summary }}</div>
      <hr/>
		</div>	
		{% endfor %}
    <div class="post">
			<div>
				<span class="post_date">05 Dec 2018</span> » <a href="https://medium.com/square-corner-blog/shard-splits-with-consistent-snapshots-adcf622842dd">Shard Splits with Consistent Snapshots</a>
			</div>
			<div class="post_summary"></div>
      <hr>
		</div>	 	
    <div class="post">
			<div>
				<span class="post_date">06 Jun 2022</span> » <a href="https://planetscale.com/blog/grouping-and-aggregations-on-vitess">Grouping and aggregations on Vitess</a>
			</div>
			<div class="post_summary"></div>
      <hr>
		</div>	 	
    <div class="post">
			<div>
				<span class="post_date">02 Nov 2021</span> » <a href="https://vitess.io/blog/2021-11-02-why-write-new-planner/">Why write a new planner</a>
			</div>
			<div class="post_summary"></div>
      <hr>
		</div>	 	
    <div class="post">
			<div>
				<span class="post_date">07 Sep 2021</span> » <a href="https://vitess.io/blog/2021-09-07-examine-query-plan/">Examining query plans in MySQL and Vitess</a>
			</div>
			<div class="post_summary"></div>
      <hr>
		</div>	
    <div class="post">
			<div>
				<span class="post_date">24 Mar 2021</span> » <a href="https://vitess.io/blog/2021-03-24-code-generation-vitess/">Code generation in Vitess</a>
			</div>
			<div class="post_summary"></div>
      <hr>
		</div>			 	
    <div class="post">
			<div>
				<span class="post_date">15 Dec 2022</span> » <a href="https://planetscale.com/blog/what-is-a-query-planner">What is a query planner?</a>
			</div>
			<div class="post_summary"></div>
      <hr>
		</div>			 	

</div>
