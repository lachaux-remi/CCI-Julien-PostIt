// Couleur ( yellow, green, pink, purple, blue, gray, black )

class PostItBoard {
    postItList = []

    constructor(tagName) {
        this.postItElement = document.querySelector(tagName)
        this.init()
    }

    init() {
        this.load().forEach(postItJson => {
            const postIt = new PostIt(this, postItJson.x, postItJson.y, postItJson.width, postItJson.height, postItJson.color, postItJson.text)
            this.postItList.push(postIt)
        })
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
        document.cookie = "postit=" + JSON.stringify(this.postItList.map(postIt => {
            return {x: postIt.x, y: postIt.y, width: postIt.width, height: postIt.height, color: postIt.color, text: postIt.text}
        })) + ";expires=" + d.toUTCString() + ";path=/";
    }
}

class PostIt {
    drag = {active: false, xOffset: 0, yOffset: 0}

    constructor(board, x, y, width, height, color, text) {
        this.board = board
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.text = text

        this.init()
    }

    init() {
        this.postIt = document.createElement('div')

        this.postIt.addEventListener('mousedown', this.dragStart, false)
        this.postIt.addEventListener('mouseup', this.dragEnd, false)
        this.postIt.addEventListener('mousemove', this.dragMove, false)

        this.render()
    }

    render() {
        this.postIt.classList.add('post-it', this.color)
        const style = this.postIt.style
        style.position = 'fixed'
        style.top = this.y + 'px'
        style.left = this.x + 'px'
        style.width = this.width + 'px'
        style.height = this.height + 'px'
        this.postIt.innerHTML = this.text

        this.board.postItElement.append(this.postIt)
        //this.actionBar()
        //this.setContent()
    }

    actionBar() {
        const actionBar = document.createElement('div')
        actionBar.classList.add('actions')

        const deleteElement = document.createElement('i')
        deleteElement.classList.add('fas', 'fa-times')
        const moveElement = document.createElement('i')
        moveElement.classList.add('fas', 'fa-arrows-alt')





        actionBar.append(moveElement, deleteElement)



        this.postIt.append(actionBar)
    }

    setContent() {
        if (this.content === undefined ) {
            this.content = document.createElement('div')
            this.postIt.append(this.content)
        }
        this.content.innerHTML = this.text
    }


    dragStart = (e) => {
        this.drag.initialX = e.clientX - this.drag.xOffset
        this.drag.initialY = e.clientY - this.drag.yOffset

        if (e.target === this.postIt) {
            this.drag.active = true;
        }
    }
    dragMove = (e) => {
        if (this.drag.active) {

            e.preventDefault();
            this.drag.currentX = e.clientX - this.drag.initialX;
            this.drag.currentY = e.clientY - this.drag.initialY;


            this.drag.xOffset = this.drag.currentX;
            this.drag.yOffset = this.drag.currentY;

            this.setTranslate(this.drag.currentX, this.drag.currentY, this.postIt);
        }
    }
    dragEnd = () => {
        this.drag.initialX = this.drag.currentX;
        this.drag.initialY = this.drag.currentY;

        this.drag.active = false;
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}