---
title: Some Things of Interest
layout: layouts/base.njk
---

<ul class="listing">
{%- for page in collections.post -%}
  <li>
    <a href="{{ page.url }}">{{ page.data.title }}</a>
    <time datetime="{{ page.date }}">{{ page.date | dateDisplay("d LLLL y") }}</time>
  </li>
{%- endfor -%}
</ul>
