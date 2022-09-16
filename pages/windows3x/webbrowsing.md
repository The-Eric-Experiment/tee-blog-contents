---
title: Windows 3.x Web Browsing
---

$$ left-content $$

[inject-md "/menu.md"]

$$ content $$

# Windows 3.x Web Browsing

Getting your Windows 3.x computer on the internet can be a lot of fun, so here's a little guide to help you to get online.

For this to work you'll need to install Windows For Workgroups 3.11 as the TCP stack can only be installed in that version.

## What do you need

- [Hardware to connect](#hardwaretoconnect)
  - [Ethernet card](#ethernetcard)
  - [Simulated Dial-Up](#simulateddialup)
  - [The Old Net Wifi Modem](#theoldnetmodem)
- [Drivers](#drivers)
- [TCP/IP stack](#tcpipstack)
- [Web Browsers](#webbrowsers)
- [Browsing Old Websites](#browsingoldwebsites)
- [Some current websites that still can run natively](#somecurrentwebsitesthatcanstillrunnatively)
- [Browsing modern websites](#browsingmodernwebsites)
- [What other things can you do online with Windows 3.x?](#whatotherthingscanyoudoonlinewithwindows3x)
- [A word on SSL](#awordonssl)

## Hardware to connect {#hardwaretoconnect}

In terms of hardware, there are three main ways to get online with your Windows 3.x machine:

### Ethernet card {#ethernetcard}

I would say that the easiest option is to go with a wired ethernet card, my recommendation for this is a PCI network card with a Realtek RTL8139 as it's easy to find and it's super easy to get working not only on Windows 3.x but in most other operating systems.

(photo)

You can find the drivers for this one right [here](/windows3x/drivers#realtekrtl8139).

You're not limited to this network card though, especially if you need to use an ISA card, there are plenty of other ones that work fine with Windows 3.x.

One disadvantage of this approach is that you need an ethernet cable to connect your computer. To mitigate this you could use a Wifi to ethernet bridge device like this one I used to use with my Windows 3.11 PC until I got actual cables to it:

(photo)

### Simulated Dial-Up {#simulateddialup}

Most people today won't have a landline with a dial-up service but you can still use a dial-up modem with an ATA device such as the Cisco SPA122 to simulate the phone line:

(photo)

In my case, I used a Linksys PAP2T as it was cheaper:

(photo)

There's a good article on how to configure the Cisco SPA122 that works pretty well with the Linksys: [https://gekk.info/articles/ata-config.html](https://gekk.info/articles/ata-config.html)

The only thing I needed to do that wasn't in the article because it's geared to a different device is to enable the "Enable IP Dialing" setting:

(ss)

For this to work, you need a something you can dial into, that could be another computer with a modem or, in my case, the Apple Airport Extreme router, the saucer type:

(photo)

This thing is cool because it has a phone jack that can be configured to receive phone calls making it an easy to use "Internet Provider".

Another cool thing about this device is that it can be used to connect old Wifi devices that don't work on modern routes because of weak encryption.

One thing to keep in mind is that you need an older version of the Apple AirPort utility to configure this device, I used the 5.6.1 version which can be downloaded [here](...download)

I learned about the possibility of using this device from this Youtube video:

^^youtube [The Livingroom video](https://www.youtube.com/watch?v=T6I3qv1kka8)

This is definitely a fun but more complicated way of getting your Windows 3.x PC online. The biggest pro of doing this is the authentic dial-up connection with all of the screaming the modems used to do. The biggest con of this approach is that the speed is SUPER slow.

So I only use this occasionaly when I want to have that specific experience.

Here's a video I made about my experience setting this thing up:

^^youtube [The 90's Internet Experience](https://www.youtube.com/watch?v=HnKV2belxgs)

### The Old Net Wifi Modem {#theoldnetmodem}

This is the last option with the potential of being the best one.

Richard Bettridge, the guy behind [TheOldNet](//theoldnet.com), has created a Serial WIFI Modem Emulator. When you connect it to your computer, it sees a Hayes compatible dial-up modem.

Previously it could only be used to connect to BBSs but recently Richard has added PPP support with the help from TheOldNet community which potentially allows Windows computers to use it as a dial-up modem that connects to your wifi network using a single device.

You can find everything you need to know about this option on its [Github page](https://github.com/ssshake/vintage-computer-wifi-modem).

Richard has made a video connecting a Mac to the internet using PPP with the modem:

^^youtube [WIFI Modem Update - PPP TCP/IP!](https://www.youtube.com/watch?v=OCrB4uAbJ0U)

I have purchased the modem but I haven't tried this yet, so I'll update this page once I have.

## Drivers {#drivers}

Regardless of what route you go, you'll need drivers to use the hardware you chose to get online.

As I mentioned before, you can get the drivers for the RTL8139 [here](/windows3x/drivers#realtekrtl8139) and I'll eventually add more networking drivers there.

If the driver you're looking for isn't available there, a good place to start looking them is the [VOGONS Vintage Driver Library](http://vogonsdrivers.com/index.php?catid=62&menustate=34,0).

I'll add a guide on how to install the drivers soon:

<center>
  <img src="/contents/public/construction.gif" alt="under construction" width="400" />
</center>

## TCP/IP stack {#tcpipstack}

Unlike Windows 95 and newer versions of Windows, Windows 3.x doesn't come with the TCP/IP stack installed by default, you have to install it yourself.

The TCP/IP stack is what allows your computer to have an IP address assigned to it so it can communicate with other computers on your network and also to make requests to websites using HTTP.

Sadly, as I mentioned before, Windows For Workgroups 3.11 is the only only one in the Windows 3.x family that can have the TCP/IP stack installed.

You can get the TCP/IP right [here](/windows3x/essentialsoftware#tcp/ip-32forwindowsforworkgroups311).

I'll add a guide on how to install it soon, but it should be pretty straightforward.

<center>
  <img src="/contents/public/construction.gif" alt="under construction" width="400" />
</center>

## Web Browsers {#webbrowsers}

When it comes to web browsers, there are multiple options. As you can probably imagine, if your goal is to have a good experience on top of the nostalgia of browsing the web on old systems like Windows 3.x, then the newer the better but, of course, given the age of Windows 3.x and architecture limitations, the most recent browsers for the system are already super old at this point. But here are the main options:

### Netscape Communicator 4.07 {#netscape407}

This is my main pick due to nostalgia, I just love Netscape and this is the latest version available for Windows 3.x. It is a good browser but sometimes it can be a bit unstable and some of its javascript, early css and even some of it's HTML apis are a bit weird and even dodgy. On top of that, due to Microsoft's monopoly, a lot of sites of that time period were made to run well only on Internet Explorer, so all of that could make some websites look a bit odd on this browsers.

But that shouldn't be an issue for the vast majority of websites of that time period, so that's why I usually go with Netscape 4.

You can download it [here](/downloads/windows3x/EssentialSoftware/n16e407.zip)

### Microsoft Internet Explorer 5.01 {#ie501}

Look, we have to be objective here, it's really sad how we got to this but Internet Explorer 5.01 is the best browser for Windows 3.x in terms of how accurately it renders pages. It's also the browser that offers the best support for javascript and css.

It can be a bit unstable sometimes though, probably becuase it's huge and complex piece of software running on Windows 3.x. On top of that Microsoft probably didn't give as much attention to it compared to the Windows 9x version.

You can download it [here](/downloads/windows3x/EssentialSoftware/ie501.zip)

If you are on a computer with more than 64mb of Ram, which is my case, the installation will fail.

You can solve that by doing the following:

> To force installation in this case, launch setup with the /f:16 flag (using the File > Run command of File/Program Manager or the MS-DOS Prompt): SETUP /f:16. [SOURCE](https://christianliebel.com/2016/06/connecting-internet-windows-workgroups-3-11/)

### Netscape Navigator 3.04 GOLD {#netscape304}

After Netscape 4.07, this would be my second option. It's not as compatible in terms of internet standards as the latest version, but it is a lighter and more stable browser. It should be enough to browse the vast majority of websites from the late 90's and early 2000's.

You can download it [here](/downloads/windows3x/EssentialSoftware/G16E304P.zip)

### Internet Explorer 4.0 {#ie4}

Similarly to Netscape 3, this browser is behind of its latest version in terms of compatibility, but it is a lighter and more stable exerience.

You can download it [here](/downloads/windows3x/EssentialSoftware/iefull.zip)

### Opera 3.62 {#opera362}

Another option of internet browser is Opera, 3.62 being it's latest version available for Windows 3.x. I don't usually use it but it's interesting to fire it up every now and then. Its compatibility should be on par with Internet Explorer 4.

You can download it [here](/downloads/windows3x/EssentialSoftware/ow362e16.zip)

## Browsing Old Websites {#browsingoldwebsites}

<center>
  <img src="/contents/public/construction.gif" alt="under construction" width="400" />
</center>

## Browsing Modern Websites {#browsingmodernwebsites}

<center>
  <img src="/contents/public/construction.gif" alt="under construction" width="400" />
</center>

## What other things can you do online with Windows 3.x? {#whatotherthingscanyoudoonlinewithwindows3x}

<center>
  <img src="/contents/public/construction.gif" alt="under construction" width="400" />
</center>

## A word on SSL {#awordonssl}

<center>
  <img src="/contents/public/construction.gif" alt="under construction" width="400" />
</center>
