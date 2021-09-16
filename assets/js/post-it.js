/**
 * Post-it board class
 */
class PostItBoard {
    /** @type {[PostIt]} */
    postItList = []
    /** @type {PostIt|undefined} */
    drag = undefined
    /** @type {PostIt|undefined} */
    resize = undefined

    /**
     * @param tagName {string} selector javascript
     */
    constructor(tagName) {
        this.postItElement = document.querySelector(tagName)
        this.init()
    }

    /**
     * Initialize post-ip board
     */
    init() {
        let index = 100
        this.load().forEach(postItJson => {
            const postIt = new PostIt(this, this.postItList.length, postItJson.x, postItJson.y, postItJson.width, postItJson.height, postItJson.color, postItJson.text, index++)
            this.postItList.push(postIt)
        })

        const addBtn = document.createElement('div')
        addBtn.classList.add('btn-add', 'fas', 'fa-plus-square')
        addBtn.addEventListener('click', () => {
            const newPostIt = new PostIt(this, this.postItList.length, 100, 100, 150, 150, 'yellow', '', index++)
            this.postItList.push(newPostIt)
            this.save()
        })
        this.postItElement.append(addBtn)

        this.postItElement.addEventListener('mousemove', this.postItActions, false)
    }

    /**
     * Load post-it form localstorage
     * @returns {[{color: string, x: number, width: number, y: number, text: string, height: number}]}
     */
    load() {
        let postItStorage = localStorage.getItem('postIt')
        if ( postItStorage !== null ) {
            return JSON.parse(postItStorage)
        }

        return [
            {x:441,y:185,width:204,height:155,color:'gray',text:'Coucou'},
            {x:626,y:298,width:176,height:151,color:'blue',text:'Bonjour'}
        ]
    }

    /**
     * Save post-it list into localstorage
     */
    save() {
        localStorage.setItem(
            'postIt',
            JSON.stringify(
                this.postItList
                    .sort((a, b) => a.index - b.index)
                    .map( postIt => {
                        return {
                            x: postIt.x,
                            y: postIt.y,
                            width: postIt.width,
                            height: postIt.height,
                            color: postIt.color,
                            text: postIt.text
                        }
                    } )
            )
        )
    }

    /**
     * Move and resize post-it event
     * @param event {MouseEvent}
     */
    postItActions = event => {
        if (this.drag !== undefined) {
            event.preventDefault();

            this.drag.x = this.drag.xOffset + event.clientX;
            this.drag.y = this.drag.yOffset + event.clientY;

            const style = this.drag.postIt.style
            style.top = this.drag.y + 'px'
            style.left = this.drag.x + 'px'
        } else if ( this.resize !== undefined ) {
            event.preventDefault();

            this.resize.width = event.clientX - this.resize.x + this.resize.xOffset
            this.resize.height = event.clientY- this.resize.y + this.resize.yOffset

            if ( this.resize.width < 128 ) this.resize.width = 128
            if ( this.resize.height < 64 ) this.resize.height = 64

            const style = this.resize.postIt.style
            style.width = this.resize.width + 'px'
            style.height = this.resize.height + 'px'
        }
    }
}

/**
 * Post-it Class
 */
class PostIt {

    /**
     * Constructor for the post-it
     * @param board {PostItBoard} Post-it board
     * @param id {number} unique post-it id
     * @param x {number} position x
     * @param y {number} position y
     * @param width{number} width post-it
     * @param height{number} height post-it
     * @param color {'yellow'|'green'|'pink'|'purple'|'blue'|'gray'|'black'} post-it color
     * @param text {string} post-it content
     * @param index {number} z-index css
     */
    constructor(board, id, x, y, width, height, color, text, index) {
        this.board = board
        this.id = id
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.text = text
        this.index = index

        this.init()
    }

    /**
     * Create post-it {HTMLElement}
     */
    init() {
        this.postIt = document.createElement('div')
        this.render()
    }

    /**
     * render post-it element
     */
    render() {
        this.postIt.classList.add('post-it', this.color)
        const style = this.postIt.style
        style.top = this.y + 'px'
        style.left = this.x + 'px'
        style.width = this.width + 'px'
        style.height = this.height + 'px'
        style.zIndex = this.index

        this.board.postItElement.append(this.postIt)

        this.actionTools()

        const content = document.createElement('div')
        content.setAttribute('contenteditable', 'true')
        content.classList.add('content')
        content.innerHTML = this.text
        this.postIt.append(content)

        new MutationObserver( () => {
            this.text = content.innerHTML
            this.board.save()
        }).observe(content, { subtree: true, characterData: true})
    }

    /**
     * Create {HTMLElement} all actions
     */
    actionTools() {
        const actionBar = document.createElement('div')
        actionBar.classList.add('actions')

        const deleteElement = document.createElement('i')
        deleteElement.classList.add('fas', 'fa-times')
        deleteElement.addEventListener('click', () => {
            this.board.postItList.splice(this.id, 1)
            this.postIt.remove()
            this.board.save()
        })

        // layer event
        const layerUpElement = document.createElement('i')
        layerUpElement.classList.add('fas', 'fa-level-up-alt')
        layerUpElement.addEventListener('click', (e) => {
            e.preventDefault()
            this.index++
            this.postIt.style.zIndex = this.index
        })
        const layerDownElement = document.createElement('i')
        layerDownElement.classList.add('fas', 'fa-level-down-alt')
        layerDownElement.addEventListener('click', (e) => {
            e.preventDefault()
            this.index--
            if (this.index < 0) this.index = 0
            this.postIt.style.zIndex = this.index
        })

        // Color selection
        const colorElement = document.createElement('div')
        colorElement.classList.add('btn-color')
        colorElement.addEventListener('click', (e) => {
            e.preventDefault()

            switch (this.color) {
                case 'yellow': this.color = 'green'; break
                case 'green': this.color = 'pink'; break
                case 'pink': this.color = 'purple'; break
                case 'purple': this.color = 'blue'; break
                case 'blue': this.color = 'gray'; break
                case 'gray': this.color = 'black'; break
                case 'black': this.color = 'yellow'; break
            }

            this.postIt.classList.remove('yellow', 'green', 'pink', 'purple', 'blue', 'gray', 'black')
            this.postIt.classList.add(this.color)
            this.board.save()
        })

        actionBar.append(layerUpElement, layerDownElement, colorElement, deleteElement)


        // Move event
        actionBar.addEventListener('mousedown', this.moveToggleOn, false)
        actionBar.addEventListener('mouseup', this.moveToggleOff, false)

        // Resize event
        const resizeElement = document.createElement('div')
        resizeElement.classList.add('btn-resize')
        resizeElement.addEventListener('mousedown', this.resizeToggleOn, false)
        resizeElement.addEventListener('mouseup', this.resizeToggleOff, false)

        this.postIt.append(actionBar, resizeElement)
    }

    /**
     * Toggle on the post-it move
     * @param event {MouseEvent}
     */
    moveToggleOn = event => {
        this.postIt.classList.add('move')
        this.xOffset = this.x - event.clientX
        this.yOffset = this.y - event.clientY
        this.board.drag = this
    }

    /**
     * Toggle off the post-it move
     */
    moveToggleOff = () => {
        this.postIt.classList.remove('move')
        this.board.drag = undefined
        this.board.save()
    }

    /**
     * Toggle on the post-it resize
     * @param event {MouseEvent}
     */
    resizeToggleOn = event => {
        this.postIt.classList.add('resize')
        this.xOffset = this.x + this.width - event.clientX
        this.yOffset = this.y + this.height - event.clientY
        this.board.resize = this
    }

    /**
     * Toggle off the post-it resize
     */
    resizeToggleOff = () => {
        this.postIt.classList.remove('resize')
        this.board.resize = undefined
        this.board.save()
    }
}