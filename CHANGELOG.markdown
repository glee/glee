[to be released]

* Smarter and faster link search
* Scrolling only takes place if selected element is not visible
* Better document scrolling using arrow keys
* Option to enable smooth scrolling outside of gleeBox
* Highlighted text when gleeBox is launched is treated as default query for Yubnub/Quix commands
* gleeBox works after executing !read
* When Esc is pressed, if gleeBox is not empty, it is emptied. If empty, it is closed
* gleeBox is not emptied when a link is opened in a new tab
* By default, gleeBox description text is empty
* Revamped Options page
* Ability to copy URL of selected link to clipboard by pressing Cmd / Ctrl + c (Chrome only)
* Fixed issue where gleeBox stole focus from <embed> input fields
* Ctrl/Cmd+Enter also opens link in new tab (in addition to Shift+Enter)
* !flags: Opens chrome://flags (Chrome only)
* !webstore: Opens Chrome Webstore (Chrome only)
* Under the hood: Code improvements

**1.8**

* Added support for Quix
* Added Developer Pack
* !tweet now uses the official twitter share bookmarklet
* Usability improvements:
	* ?? selects the existing text in a textfield/textarea
	* Scrolling using arrow keys selects the topmost visible element (when esp vision/scraper is active). Works best in Chrome.
	* Radios/checkboxes can be checked/unchecked using gleebox
	* Performance improvements including faster link search
* Changed layout for scrapers and visions in Options page. Also, ability to filter through them.
* Added !snap, !plugins and !labs commands (Chrome only)
* Minor Safari bugfixes

<br>
**1.6.3**

* Prettier and more robust highlighting (thanks to towolf)
* Sync for Chrome
* Removed Save button from Options page. Changes are saved instantly.
* Bugfixes for Safari extension
* More robust gleeBox appearance

<br>
**1.6.2** - *26 Jul 2010*

* Usability improvements
* Removed Browser Action [Chrome]
* Autocompletion for recently executed commands [Chrome]
* Options page more accessible via keyboard [Chrome]
* Changed the default position to bottom

<br>
**1.6** - *14 Apr 2010*

* Backup: Export/Import your gleeBox settings (also between Firefox and Chrome)
* Consistent Enter/Shift+Enter behavior for page commands
* Added support for AddThis
* !ext and !down page commands [Chrome only]
* Options page spruced up [Chrome only]
* Other Bugfixes

<br>
**1.5** - *14 Mar 2010*

* Glee Tab Manager: Manage currently open tabs [Chrome only]
* Customizable launch key for gleeBox
* gleeBox is cleared on executing yubnub commands and links via default search
* Added ability for sites to define their own ESP
* !v command to play/pause videos on YouTube [Chrome only]
* Editable items on Options page [Chrome only]
* Support for `<button>` element
* Updated to use jQuery 1.4.1
* Lots of CSS Fixes
* Improvements to scrolling
* !inspect command to get the jQuery selector for specific elements
* Ability to add visions/scrapers via set command
* Modified !tweet command so it also includes title of page being shared

<br>
**1.1** - *29 Jan 2010*

* Input elements of type button/submit added to default link search
* Text field input is now escaped for HTML tags
* Fixed CSS issues
* [Chrome] Keeping TAB pressed results in continuous scrolling
* [Chrome] Title text for browser action changes on click
* [Chrome] Changes to disabled urls in options are spread properly
* [Chrome] Fixed toggle of status using browser action
* [Chrome] Custom scrapers work properly when browser is first run

<br>
**1.0.3** *(Firefox)*  
* Replaced occurrences of eval with alternatives

<br>
**1.0.2** *(Firefox)*  
* Completely resolved the iframe issue where textfield/textarea inside an iframe wasn't accepting text input
* Fixed set command

<br>
**1.0.1** *(Firefox)*  
* Partly solved iframe issue where gleeBox was inserting HTML inside iframes

<br>
**1.0**  

* Custom scraper commands
* ESP mode
* Custom search engine option
* Better traversing
* Better scrolling
* Fully functional jQuery mode
* Storage using DB in Chrome (instead of localStorage)
* New commands - !set, !tipjar, !options
* CSS Bugfixes
* Performance improvements (reduced jQuery calls)

<br>
**0.6.1** - *16 Dec 2009*  

* Minor bug fixes - CSS theme fix and subtext not getting set for ?img

<br>
**0.6** - *15 Dec 2009*  

* Bookmarks integration in default search (Chrome)
* Bookmarklets as commands (Chrome)
* Added Options page (Chrome)
* Option for box location and size
* Option for bookmarks integration
* Option for disabling scrolling animation
* Added linked images' alt text search into default search
* Themes!
* New commands - ?p, ?a, !rss, !help
* Bug fixes