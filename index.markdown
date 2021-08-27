<div>Hi!

Welcome to this little collection of my writings. I write mostly about query optimizers.
Find more of my online stuff here:

<ul>
  <li><a href="https://github.com/systay">Github</a> </li>
  <li><a href="https://twitter.com/andres_taylor">Twitter</a></li>
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
</div>
