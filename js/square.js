class Squares{
    constructor(){
        this.squares = [];
    }

    clear(){
        this.squares = [];
    }

    add(square){
        if (!this.exists(square)) this.squares.push(square);
    }
    
    exists(square){
        for (let element of this.squares){
            if (element.isEqual(square)) return true;
        }
        return false;
    }

    getAll(point){
        let list = [];
        for (let element of this.squares) {
            if (element.contains(point)) {
                list.push(element);
            }
        }
        return list;
    }
}

class Square {
    constructor(a,b,c,d){
        this.square = [a,b,c,d];
        this.area = (a.x-b.x)**2+(a.y-b.y)**2;
    }

    get(){
        return this.square;
    }

    getArea(color){
        for (let point of this.get()){
            if (point.color!=color) return 0;
        }
        return this.area;
    }

    isSquare(){
        let [a,b,c,d] = this.square;
        if (a==b || a==c || a==d || b==c || b==d ||c==d) return false;
        if (b.x-a.x != c.x-d.x) return false;
        if (c.x-b.x != d.x-a.x) return false;
        if (b.y-a.y != c.y-d.y) return false;
        if (c.y-b.y != d.y-a.y) return false;
        if (c.x-a.x != d.y-b.y) return false;
        if (c.y-a.y != b.x-d.x) return false;
        return true;        
    }

    contains(p){
        for (let point of this.square){
            if (p == point) return true;
        }
        return false;
    }

    isEqual(square){
            for (let point of square.get()){
            if (!this.contains(point)) return false;
        }
        return true;
    }

    coloredPoints(color){
        let n=0;
        for(let point of this.square) {
            if (point.color==color) n++;
        }
        return n;
    }
    
    draw(context, scale){
        let moves = settingsForm.moves.value;
        let points1 = this.coloredPoints(COLORS[0]);
        let points2 = this.coloredPoints(COLORS[1]);
        if (points1 > 0 && points2 > 0) return;
        if (points1 == 0 && points2 == 0 && moves=='4'){
            this.render(context, scale, 1, COLORS[0]);
            this.render(context, scale, 1, COLORS[1]);
            return;
        }
        if (points1 > 0 && (points1 + +moves >= 4)) {
            this.render(context, scale, points1+1, COLORS[0]);
            return;
        }
        if (points2 + +moves >= 4) this.render(context, scale, points2+1, COLORS[1]);
    }

    render(context, scale, width, color){
        context.lineWidth = width;
        context.strokeStyle = color;    
        context.beginPath();
        context.moveTo(scale*(this.square[0].x+1/2), scale*(this.square[0].y+1/2));
        for(let point of this.square) context.lineTo(scale*(point.x+1/2), scale*(point.y+1/2));
        context.closePath();
        context.stroke();
    }
}

class Point extends HTMLElement {
    constructor(x, y, scale){
        super();
        this.scale = scale;
        this.x=x;
        this.y=y;
        this.color='';
        this.onmouseover = this.onMouseOver;
        this.onmouseout = this.onMouseOut;
        this.onclick = this.select;
        this.className='hover';
    }

    connectedCallback() {
        this.style.top = this.scale*(this.y+1/2)-parseInt(this.offsetHeight,10)/2-1+'px';
        this.style.left = this.scale*(this.x+1/2)-parseInt(this.offsetWidth,10)/2-1+'px';
    }

    select() {
        this.onMouseOut();
        this.color = COLORS[game.turn%2];
        this.style.background = this.color;
        game.drawCompletedSquares(this, this.color);
        game.addScore(this.calcArea(this.color));
        this.onclick = null;
        this.classList.remove('pulse');
        this.classList.add('updown');
        this.classList.toggle('hover');
        game.nextTurn();
    }

    onMouseOver() {
        if (this.color===''){
            this.classList.add('pulse');
            this.style.background = COLORS[game.turn%2];            
        }
        game.drawSquares(this);
    }

    onMouseOut() {
        this.classList.remove('pulse');
        this.style.background = this.color;
        tContext.clearRect(0, 0, tCanvas.width, tCanvas.height);
        this.title='';
    }

    calcArea(color){
        let area=0;
        let squares = game.squares.getAll(this);
        for (let square of squares){
            area += square.getArea(color);
        }
        return area;
    }
}
