#!/bin/sh

# execute to bring the Glee Safari version up-to-date with the Chrome version.
# this script replaces the common Javascript and CSS in Safari with those from the Chrome version.

# IMPORTANT: execute only from '/Safari'

chrome_dir="../Chrome/glee_chrome/"
safari_dir="gleeBox.safariextension/"

chrome_js_dir="../Chrome/glee_chrome/js/"
safari_js_dir="gleeBox.safariextension/js/"

chrome_css_dir="../Chrome/glee_chrome/css/"
safari_css_dir="gleeBox.safariextension/css/"

current_dir=`pwd`

# remove all safari js files except those beginning with safari_
echo "Removing all Safari JS files..."
cd $safari_js_dir
for f in *
do
    if [ $f != safari ]
    then
        rm -rfv $f
    fi
done

echo "\nCopying JS files over from Chrome..."
# copy all chrome js files over to safari except chrome specific files
cd $current_dir;
cd $chrome_js_dir
js_list=(*)
len=${#js_list[@]}

cd $current_dir
for (( i = 0; i < len; i++ ))
do
    f=${js_list[$i]}
    if [ $f != chrome ]
    then
        cp -rv $chrome_js_dir""$f $safari_js_dir
    fi
done

echo "\nRemoving all Safari CSS files..."
# remove all safari css files except those beginning with safari_
cd $safari_css_dir
for f in *
do
    if [ $f != safari ]
    then
        rm -rfv $f
    fi
done

echo "\nCopying CSS files over from Chrome..."
# copy all chrome css files over to safari except those beginning with chrome_
cd $current_dir;
cd $chrome_css_dir
css_list=(*)
len=${#css_list[@]}

cd $current_dir
for (( i = 0; i < len; i++ ))
do
    f=${css_list[$i]}
    # copy non-chrome specific files
    if [ $f != chrome ]
    then
        cp -rv $chrome_css_dir""$f $safari_css_dir
    fi
done

# todo: automatically replace /chrome/options.js with /safari/options.js and remove sync HTML
# echo "\nRemoving options.html from Safari..."
# cd $safari_dir
# rm -rfv options.html
#
# echo "\nCopying over options.html from Chrome..."
# cd $current_dir
# cp -rv $chrome_dir"options.html" $safari_dir