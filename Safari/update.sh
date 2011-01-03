#!/bin/sh

# execute to bring the Glee Safari version up-to-date with the Chrome version.
# this script replaces the common Javascript and CSS in Safari with those from the Chrome version.

# execute in /Safari

chrome_js_dir="../Chrome/glee_chrome/js/"
safari_js_dir="gleeBox.safariextension/js/"

chrome_css_dir="../Chrome/glee_chrome/css/"
safari_css_dir="gleeBox.safariextension/css/"

current_dir=`pwd`


# remove all safari js files except those beginning with safari_
echo "Removing all Safari JS files..."
cd $safari_js_dir
for f in *.js
do
	if [[ "$f" != safari_* ]]
	then
		rm -rfv $f
	fi
done

echo "\nCopying files over from Chrome..."
# copy all chrome js files over to safari except those beginning with chrome_
cd $current_dir;
cd $chrome_js_dir
js_list=(*.js)
len=${#js_list[@]}

cd $current_dir
for (( i = 0; i < len; i++ ))
do
	f=${js_list[$i]}
	# copy non-chrome specific files
	if [[ "$f" != chrome_* ]]
	then
		cp -v $chrome_js_dir""$f $safari_js_dir
	fi
done

echo "\nRemoving all Safari CSS files..."
# remove all safari css files except those beginning with safari_
cd $safari_css_dir
for f in *.css
do
	if [[ "$f" != safari_* ]]
	then
		rm -rfv $f
	fi
done

echo "\nCopying CSS files over from Chrome..."
# copy all chrome css files over to safari except those beginning with chrome_
cd $current_dir;
cd $chrome_css_dir
css_list=(*.css)
len=${#css_list[@]}

cd $current_dir
for (( i = 0; i < len; i++ ))
do
	f=${css_list[$i]}
	# copy non-chrome specific files
	if [[ "$f" != chrome_* ]]
	then
		cp -v $chrome_css_dir""$f $safari_css_dir
	fi
done