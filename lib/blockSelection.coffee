class @BlockSelection
    constructor: (@game) -> @current = "cobblestone"

    blockImg: (name) -> "<img width='32' height='32' src='./textures/#{name}icon.png' id='#{name}'/>"

    mousedown: (e) ->
        return false if e.target == @
        @select e.target.id
        return false

    mousewheel: (delta) ->
        dif = (if delta >= 0 then 1 else -1)
        index = (Blocks.indexOf(@current) - dif).mod(Blocks.length)
        @select Blocks[index]

    ligthUp: (target) -> @_setOpacity target, 0.8
    lightOff: (target) -> @_setOpacity target, 1

    select: (name) ->
        return if @current is name
        @game.selectCubeBlock name
        @ligthUp name
        @lightOff @current
        @current = name

    _setOpacity: (target, val) -> $("#" + target).css(opacity: val)

    insert: ->
        blockList = (@blockImg(b) for b in Blocks)
        domElement = $("#minecraft-blocks")
        domElement.append blockList.join('')
        @ligthUp @current
        domElement.mousedown (e) => @mousedown e
        $(document).mousewheel (e, delta) => @mousewheel delta
        domElement.show()
