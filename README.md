# Popup Video Player

This widget shows a small preview thumbnail and title for a YouTube or Vimeo video.
When clicked, it will open the video in a popup.
Clicking outside the popup closes it again.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Configuration

### Data Source

#### Video ID Attribute
This is the attribute containing the ID for the video. Make sure this matches the Video Source that is specified.

#### Video Source
Here you can specify if the video ID will be for YouTube or Vimeo. These are currently the only supported video providers.
Please send in an issue if you would like to see another video platform supported.

### General

#### Autoplay
You can set this to have the video autoplay once the popup opens.

### Appearance

#### Player Width
The width of the popup.

#### Player height
The height of the popup.

### Behavior

#### On Click Microflow
An optional microflow that is triggered when the popup is opened.