Glee: Instruction manual

Glee is a purely experimental project and is meant for a very niché audience (hackers mostly). So, it is very possible, that at first you find it hard to conceive the utility of Glee.

General Keys:

g - Launch Glee

TAB Key - Move to the next selected element

Shift+TAB - Move to the previous selected element

ENTER - Launch a link or execute a command

Shift+ENTER - Open a link in a new tab

ESC - Quit Glee when it is focussed. In case it isn't, press 'g' to quit Glee

Default behavior:

When you enter any text, Glee will search for links on the current page whose text matches your query. If it finds any links, it will highlight them and you can scroll through them by pressing the TAB key. You can open a particular link by pressing ENTER. 

In case Glee doesn't find any links, when you press ENTER, it will either search the text on Google or will directly go to a URL if you entered a URL like twitter.com.

Simple Commands:

?h - Highlight all the main headings (h1,h2 & h3 only) on the current page
?img - Highlight all the images on the page
?? - Highlight all the input fields on the page

These are examples of how additional plugins can be built into Glee. You only need to know a bit of JavaScript in order to spin up your own plugin:

!read - Transform the page for a better reading experience using Readability
!shorten - Shorten the URL of the current page 
!tweet - Redirect to twitter with the URL of the current page in the textfield

Advanced Commands:

:command - Here command is a yubnub command. List of yubnub commands is available at yubnub.org. While using this command, $ can be used to point to the URL of the current page. A few cool examples are:

:fbshare $ - Share the current page as link on Facebook
:wp - Search wikipedia
:tube - Search YouTube
:imdb - Search IMDB

*selector - Here selector is a jQuery selector.
