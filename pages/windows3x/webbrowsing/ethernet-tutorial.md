---
title: Setting-up Ethernet TCP Networking
---

$$ content $$

## Windows 3.x resource page {#windows3xresourcepage}

[inject-md "../menu.md"]

# Setting-up Ethernet TCP Networking {#settingupethernettcpnetworking}

In this tutorial you can learn how to setup an ethernet connection on Windows 3.11 For Workgroups with the TCP/IP for internet browsing, file sharing and other networking needs.

1. First we need to download the [TCP/IP-32 for Windows for Workgroups 3.11](/windows3x/essentialsoftware#tcp/ip-32forwindowsforworkgroups311) and copy it to the computer where it'll be installed. There are many ways that can be done depending on if you're running it on bare metal or a virtual machine. I'll leave that one for you to figure out since it's out of the scope of this tutorial.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_1_tcp32b.jpg)

2. Once in the Windows 3.11 computer's hard drive, we'll double click the executable so the files can be extracted. They'll all be extracted in the same folder as the tcp32b.exe executable, so I recommend you create a folder with just that in it.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_2_tcp32b_unpacked.jpg)

3. We'll also need the ethernet adapter drivers, such as the [Realtek RTL8139](/windows3x/drivers#realtekrtl8139) drivers I suggested before. You'll have to find the correct drivers for your Ethernet adapter. As I mentioned before the [VOGONS Vintage Driver Library](http://vogonsdrivers.com/index.php?catid=62&menustate=34,0) is a great place to find drivers.

4. First we'll install the Ethernet Adapter drivers, to do that we go back to the Program Manager and in the Network Group we will go into Network Setup.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_3_net_setup_shortcut.jpg)

5. Once in Network Setup we'll add a new Driver by clicking the **"Drivers..."** button.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_4_net_setup.jpg)

6. Then in Network Drivers we'll click on **"Add Adapter..."** button.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_5_net_drivers.jpg)

7. If you are lucky enough to have a Network Adapter from the list, you can just go with that, otherwise we'll select **"Unlisted or Updated Network Adapter..."** because we download our drivers from the internet.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_6_unlisted_net_drivers.jpg)

8. This is the part where we select the folder where our driver is in, we must click on **"Browse..."**...

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_7_install_driver.jpg)

9. ... And select the folder where our driver is:

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_8_browse.jpg)

<br />

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_9_install_driver_folder.jpg)

10. After clicking **OK** in Install Driver, the available drivers should appear in the **Network Adapters** list of **"Unlisted or Updated Network Adapter"**, we just need to select the one we want to install and press **OK** again and the files will be installed.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_10_select_driver.jpg)

11. Now that we have the Network Adapter installed, we need to install the TCP/IP protocol that we extracted earlier, to do that we click on **"Add Protocol..."**

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_11_net_drivers_installed.jpg)

12. Because Windows 3.11 doesn't support TCP/IP out of the box, we'll have to select **"Unlisted or Updated Protocol"**.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_12_add_net_protocol.jpg)

13. Like we did with the Network Adapter, we'll select the folder where the TCP/IP files are by clicking on **"Browse..."**

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_13_install_driver.jpg)

14. Again we select the folder where the protocol is:

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_14_select_folder.jpg)

<br />

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_15_folder_selected.jpg)

15. After pressing **OK** the TCP/IP protocol will show up in the **Protocols** list, we just need to select it and press **OK** again and the protocol files will be installed.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_16_select_tcpip.jpg)

16. Now that the protocol is installed and showing up under the Network Adapter, we need to set it as the default protocol.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_17_set_as_default.jpg)

17. And then we can actually configure TCP/IP by double-clicking it or selecting and pressing the **"Setup..."** button on the right.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_18_setup_protocol.jpg)

18. Now inside the **"Microsoft TCP/IP Configuration"** we setup our IP address.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_19_configure_ip.jpg)

19. You can either select **"Enable Automatic DHCP Configuration"** so the computer gets assigned an IP address by the router.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_20a_default_gateway.jpg)

Lately I've been having some issues with DHCP with more modern routers, you might want to try to set the **Default Gateway** to tell your computer the address of your router, it might help.

But I honestly prefer to just setup a static IP address:

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_20b_fixed_ip.jpg)

20. After that I like setting up a DNS server, I like spoonfeeding everything to the computer so it doesn't have any issues, to do that you can click on **"DNS..."**

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_21_click_dns.jpg)

21. Here you can enter the IP address of the DNS server you want to use:

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_22_configure_dns.jpg)

I put **_1.1.1.1_** which is the Cloudflare DNS server, but you can use anything like the Google ones **_8.8.8.8_** and **_8.8.4.4_** or even the [Ucanet](//ucanet.net/) if you want to browse retro websites.

After entering each DNS server on the left, we need to press **"Add ->"** so they can be added to the DNS list.

22. After done we just need to press **OK**.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_23_add_dns.jpg)

23. Then we need to press **OK** in **"Microsoft TCP/IP Configuration"**...

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_24_ok_tcp_config.jpg)

24. ... And then close the **"Network Drivers"** dialog.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_25_close_net_drivers.jpg)

25. And then press **OK** in **"Network Setup"**

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_26_close_net_setup.jpg)

26. At this point Windows might ask you to enter an User Name, which you can use your name, a Workgroup, which you can leave as "WORKGROUP" and a Computer Name, which is the name your computer will be known as on the Network.

27. After pressing **OK** on that, Windows might ask for the **"Microsoft Windows for Workgroups 3.11 Disk 7 and 8"** so it can finish installing some of the network drivers.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_27_install_remaining_win_drivers.jpg)

28. Just select the location of your Windows 3.11 disks and allow the installation to complete.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_28_installing_remaining_win.jpg)

29. After that Windows will tell you it updated the **AUTOEXEC.BAT** and the **SYSTEM.INI** files, you just need to press **OK** on that.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_29_ok_net_setup.jpg)

30. Then you just need to restart the computer after that by clicking on the **"Restart Computer"** button.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_30_restart_computer.jpg)

31. After restarting, you should see the login screen, that means the Network Stack was installed successfully.

![](/contents/pages/windows3x/webbrowsing/ethernet-tutorial/net_31_login.jpg)

This concludes the tutorial, after logging in we can test if the internet connection is working, to do that we'll need a web browser, which we'll explore in the [Web Browsing](/windows3x/webbrowsing) page.
