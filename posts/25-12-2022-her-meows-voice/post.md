---
title: Her Meow's Voice
date: 23-06-2020
tags: 3d printing, mp3, music, mp3 player, tinkering, cats, original music, composition, christmas, fiancée, speaker, electronics
category: 3D Printing, Design, Music, Tinkering
image: img.jpg
description: I recorded some music with my cats' voices and built a little device to play them as a christmas gift to my fiancée
---

I had big plans for my fiancée's (Joey) christmas gift, and it was something that only grew in requirements. The initial idea was to 3d print a gramophone that would:

- Have an arduino and an MP3 player module inside in which would play some songs that I recorded made with the meows of our cats, Maddy, Maple and Mercedes.
- Have a tone arm, like an actual gramophone which, when she put the needle on the fake record, it would start playback.
- Have the ability to skip a song by lifting and putting the needle down again.
- Stop the playback if the needle wasn't on the record for a few seconds.

But ideas kept coming and the scope kept increasing. I also decided to:

- Make it a bluetooth speaker where she could switch between bluetooth mode where she could listen to her music, and record mode where she could listen to the music I recorded.
- Have the record rotating while music was playing
- Make the main shell out of wood by laser cutting plywood.
- Have a way to change music by swapping fake records.

And I was making progress with it, I did have the switch between bluetooth and the MP3 working and I could play, skip songs and stop with one button.

[gallery]

- title: Prototype

- [](/contents/posts/25-12-2022-her-meows-voice/orig-1.jpg)
- [](/contents/posts/25-12-2022-her-meows-voice/orig-2.jpg)
- [](/contents/posts/25-12-2022-her-meows-voice/orig-3.jpg)
- [](/contents/posts/25-12-2022-her-meows-voice/orig-4.jpg)

[/gallery]

Needless to say though, I was a victim of scope creep and christmas was getting closer and closer. After some time it became clear that I wouldn't be able to finish this whole thing, so I decided to go back to basics and focus on the main part, which was the music, as worst case scenario I could just record a CD or put the music on a flash drive and that my fiancée would be super happy about it.

So I recorded the meows of my cats, except for Mercedes, she's gone, so I had to find videos of her where she was meowing, which was hard, I could only find one.

I didn't want to change the pitch of the meows as I wanted them to sound as they were so, for each song I found out which notes the cats were meowing in and I found which scale was the closest to them, then I recorded a little song for each one of them, here's a little snippet of Maddy's and Maple's songs:

### Maddy

<embed src="/contents/posts/25-12-2022-her-meows-voice/maddy.mp3" type="audio/mpeg" width="300" height="50" controls="controls">

### Maple

<embed src="/contents/posts/25-12-2022-her-meows-voice/maple.mp3" type="audio/mpeg" width="300" height="50" controls="controls">

Maple meows without opening her mouth a lot haha.

For Mercedes I only had one video, and I found another one where she was scratching the door. So I made a little slow ballad with her voice and used the scratches as percussion.

There was one last song I made using Joey's mom telling me off about eating unhealthy which I made into a rap, it ended up really funny.

I won't share those last two here because Mercedes one is kinda sad and I don't think Joey's mom will like me posting that here, even though she finds it hilarious.

After that I still had some time left, so I decided to make a little radio out of a mono MP3 player module. It is a little board with the audio controls, a headphone jack, some headers for a speaker and an USB port. It also has headers for power so it can be battery powered but I decided not to put a battery in it. This is what it looks like with the speaker soldered to it:

![The MP3 Module](/contents/posts/25-12-2022-her-meows-voice/board-with-speaker.jpg)

Then I 3D printed a case with with the buttons, here's the front with the buttons in it:

![3D Printed Case](/contents/posts/25-12-2022-her-meows-voice/shell.jpg)

So it was a matter of putting the board in with the SD card:

![Case with module and speaker in](/contents/posts/25-12-2022-her-meows-voice/shell-with-board.jpg)

Then I closed it and painted the front:

![Final Product](/contents/posts/25-12-2022-her-meows-voice/holding.jpg)

As you can see, there are two acoustic resonance "holes" that I hoped would help with the sound (it didn't) and the front says "Her Meow's Voice", which is a little play with HMV (His Master's Voice).

On the top, there's a little grill in a pattern that looks like the pattern on a cat's head, which is the grill for the speaker:

![Speaker](/contents/posts/25-12-2022-her-meows-voice/speaker-grill.jpg)

On the bottom you can see the micro-usb port that can be used to power it, and a the headphone jack so you can get better quality audio out if it:

![Bottom](/contents/posts/25-12-2022-her-meows-voice/bottom.jpg)

Before closing it shut though, I still had some time, so I had a bit more fun with it and turned it with into a little radio station, I made a few fake commercials with some inside jokes, made a theme song for the radio and announcements to play between the songs. The last thing it plays is 5 hours of Maddy's pur, which is the most soothing sound in the world. I'd put that track here, but that's over 600mb in size.

And that's it, that's Joey's main christmas gift for 2022. I really like how it turned out, and the fact I couldn't do everything I originally planned is actually a good thing, because it is a more focused present and doesn't have other random features to distract from the main one.

Thanks!
