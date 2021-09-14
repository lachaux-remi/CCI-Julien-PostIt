// Couleur ( yellow, green, pink, purple, blue, gray, black )

class PostItBoard {
    postItList = []
    drag = undefined
    resize = undefined

    constructor(tagName) {
        this.postItElement = document.querySelector(tagName)
        this.init()
    }

    init() {
        let index = 100
        /*const t = [
            {x:100,y:100,width:200,height:500,color:'blue',text:'Bonjour'},
            {x:20,y:100,width:200,height:500,color:'gray',text:'Coucou'}
        ]*/
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

    load() {
        let name = "postit=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return JSON.parse(c.substring(name.length, c.length));
            }
        }
        return [];
    }

    save() {
        const d = new Date();
        d.setTime(d.getTime() + (3650*24*60*60*1000));
        document.cookie = "postit=" + JSON.stringify(this.postItList.sort((a, b) => a.index - b.index).map(postIt => {
            return {x: postIt.x, y: postIt.y, width: postIt.width, height: postIt.height, color: postIt.color, text: postIt.text}
        })) + ";expires=" + d.toUTCString() + ";path=/";
    }

    postItActions = (e) => {
        if (this.drag !== undefined) {
            e.preventDefault();

            this.drag.x = this.drag.xOffset + e.clientX;
            this.drag.y = this.drag.yOffset + e.clientY;

            const style = this.drag.postIt.style
            style.top = this.drag.y + 'px'
            style.left = this.drag.x + 'px'
        } else if ( this.resize !== undefined ) {
            e.preventDefault();

            this.resize.width = e.clientX - this.resize.x + this.resize.xOffset
            this.resize.height = e.clientY- this.resize.y + this.resize.yOffset

            if ( this.resize.width < 128 ) this.resize.width = 128
            if ( this.resize.height < 64 ) this.resize.height = 64

            const style = this.resize.postIt.style
            style.width = this.resize.width + 'px'
            style.height = this.resize.height + 'px'
        }
    }
}

class PostIt {
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

    init() {
        this.postIt = document.createElement('div')
        this.render()
    }

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

        this.resizeIcon()
    }

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

    resizeIcon() {
    }

    moveToggleOn = (e) => {
        this.postIt.classList.add('move')
        this.xOffset = this.x - e.clientX
        this.yOffset = this.y - e.clientY
        this.board.drag = this
    }

    moveToggleOff = () => {
        this.postIt.classList.remove('move')
        this.board.drag = undefined
        this.board.save()
    }

    resizeToggleOn = (e) => {
        this.postIt.classList.add('resize')
        this.xOffset = this.x + this.width - e.clientX
        this.yOffset = this.y + this.height - e.clientY
        this.board.resize = this
    }

    resizeToggleOff = (e) => {
        this.postIt.classList.remove('resize')
        this.board.resize = undefined
        this.board.save()
    }
}