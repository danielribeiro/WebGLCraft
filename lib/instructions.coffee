class @Instructions
    constructor: (@callback) ->
        @domElement = $('#instructions')

    instructions:
        leftclick: "Remove block"
        rightclick: "Add block"
        drag: "Drag with the left mouse clicked to move the camera"
        save: "Save map"
        pause: "Pause/Unpause"
        space: "Jump"
        wasd: "WASD keys to move"
        scroll: "Scroll to change selected block"

    intructionsBody: ->
        @domElement.append "<div id='instructionsContent'>
                                         <h1>Click to start</h1>
                                         <table>#{@lines()}</table>
                                         </div>"
        $("#instructionsContent").mousedown =>
            @domElement.hide()
            @callback()
        return

    ribbon: ->
        '<a href="https://github.com/danielribeiro/WebGLCraft" target="_blank">
                      <img style="position: fixed; top: 0; right: 0; border: 0;"
                      src="http://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
                      alt="Fork me on GitHub"></a>'

    insert: ->
        @setBoder()
        @intructionsBody()
        minecraft = "<a href='http://www.minecraft.net/' target='_blank'>Minecraft</a>"
        legal = "<div>Not affiliated with Mojang. #{minecraft} is a trademark of Mojang</div>"
        hnimage = '<img class="alignnone" title="hacker news" src="http://1.gravatar.com/blavatar/96c849b03aefaf7ef9d30158754f0019?s=20" alt="" width="20" height="20" />'
        hnlink = "<div>Comment on  #{hnimage} <a href='http://news.ycombinator.com/item?id=3376620'  target='_blank'>Hacker News</a></div>"
        @domElement.append legal + hnlink + @ribbon()
        @domElement.show()

    lines: ->
        ret = (@line(inst) for inst of @instructions)
        ret.join(' ')

    line: (name) ->
        inst = @instructions[name]
        "<tr><td class='image'>#{@img(name)}</td>
                      <td class='label'>#{inst}</td></tr>"

    setBoder: ->
        for prefix in ['-webkit-', '-moz-', '-o-', '-ms-', '']
            @domElement.css prefix + 'border-radius', '10px'
        return

    img: (name) -> "<img src='./instructions/#{name}.png'/>"