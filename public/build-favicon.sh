
pushd .
cd assets
inkscape --export-type='png' --export-filename='icon.png' icon.svg
convert icon.png -resize 128x128 -gravity center -extent 128x128 icon-scaled.png
ffmpeg -y -i icon-scaled.png favicon.ico
popd
