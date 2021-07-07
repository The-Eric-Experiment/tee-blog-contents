---
title: Today's Web on Old Browsers
date: 02-04-2021
tags: retro computing, internet, browservice, wrp, web rendering proxy, retro software
category: Retro Computing, Computing, Videos
image: img.jpg
description: A video about the magic of being able to use moder websites on old browsers such as NCSA Mosaic, Netscape 4, Internet Explorer 4 and so on.
---

One thing that brings me a huge deal of nostalgia is the Web 1.0. Don't get me wrong, I wouldn't trade our modern internet and computers for the experience we had in the 90's, but I definitely remember the experience of connecting to the internet via dial-up, using old browsers like Netscape Navigator 4 and going on websites like Geocities very fondly.

Even though the modern internet is way better and more convinient, I do think it lacks a bit of personality compared to the time we had personal web sites and such.

It's lovely that we have services like the [Web Archive](https://archive.org/) and [The Old Net](http://theoldnet.com/) that not only allows us to access those websites but, in the case of The Old Net, it lets us access them through old browsers like my beloved Netscape Navigator 4.

What kinda sucks though is that you can't access the modern web on those browsers and on older operating systems.

Or can't we?

In this video we explore 3 different solutions to proxying a headless instance of Google Chrome from a modern computer to an old computer running old browsers, effectivelly allowing us to browse the modern web on very old browsers.

Those pieces of software are:

- [Web Rendering Proxy](https://github.com/tenox7/wrp) - With this you can browse the modern web on very, VERY old browsers. We're talking NCSA Mosaic, Internet Explorer 2.0, Netscape 2.0 and so on. This is a very clever solution albeit with some limitations, one of them being that it's a bit slow to reload the page between clicks.

- [Browservice](https://github.com/ttalvitie/browservice) - The difference between this and WRP is that Browservice makes use of some Javascript to make the page more interactive, it basically streams down screenshots to your browser. This solution makes it incompatible with browsers older than Internet Explorer 4 and Netscape 7, but virtually all operating systems have at least one browser that is capable of running Browservice. It is possible to get it working on Netscape 4 and 6 as I show in the video, but in a somewhat limited manner.

- [My own proxy server](https://github.com/ericmackrodt/webproxy) - I love Netscape, it's my favorite browser, which means that I really want to be able to browse the web on them, you could use WRP but I like the interactivity of Browservice, so I wrote this one in NodeJS that basically mixes both approaches while focusing on Netscape 4. This software is super rough but it works pretty well on that browser.

Now, I decided to rewrite my proxy service in GoLang but the reason I didn't feature it in the video is that it wasn't ready at that time. Right now it is in the same state as the NodeJS one but this is the one I'm probably gonna put some more effort on, I want to somehow get it working on Netscape 3. You can check it out [here](https://github.com/ericmackrodt/netscape-proxy).

Regardless, as I say in the video, Browservice is probably my choice in proxy services due to its maturity, quality and interactivity.

[Click here](https://www.youtube.com/watch?v=LNaQC-5VkGw) to go to the Youtube Video.

!yt[Today's Web on Old Browsers](https://www.youtube.com/watch?v=LNaQC-5VkGw)

I actually had to re-upload this video which means that I lost the views and comments from my previous one.

The reason for this is that I usually use google ads to promote my videos when they come out but, this time, Google was blocking this video from being advertised.

The reason they gave me was that it dealt with "sensitive subjects".

I know right, old browsers, a sensitive subject? That doesn't make any sense.

And the worst thing is that they just say "sensitive subject" but they don't tell you what the actual issue is.

I tried to appeal, contact google ads support and such with no luck.

So I went through the video carefully to see if there was anything that could've triggered that and the only thing I could come up with was some screen captures of wikipedia and google search that showed some current topics.

I went into the youtube edits and blurred everything that had to do with politics. That didn't help.

Then I went in again and found two instances where a screen capture showed the name of the famous pandemic we're going through, It's like Voldemort, you should never have any reference to it's name. One of the instances where the name appeared was in google's own search suggestions in a screen capture, so ironic!

So I went into the Youtube Editor and tried to blur those as well, after I confirmed my video was being processed for over 14 hours! It basically got stuck processing!

After contacting team youtube on Twitter, they recommended deleting the video and re-uploading it, so I did that reluctantly making sure I blurred anything that could be considered a sensitive subject in the screen captures.

And here's where we are today, with a re-upload that definitely hurts my already struggling channel. That's awesome!
