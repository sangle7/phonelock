import './phonelock.css'
export class Phonelock {
	/**
	 * [constructor 初始化]
	 * @Sangle
	 * @DateTime 2017-03-29T11:28:07+0800
	 * @param    {[Object]}                 obj [输入自定义项]
	 */
	constructor(obj) {
		this.passwordObj = {
			password: localStorage.touchpw ? this.initPassword(localStorage.touchpw) : null,
			step: localStorage.step || null
		};
		this.corrrectColor = obj.corrrectColor || 'green';
		this.warningColor = obj.warningColor || 'red';
		this.bgColor = obj.bgColor || 'pink';
		this.emphasizeColor = obj.emphasizeColor || 'orange';
		this.textColor = obj.textColor || 'black';
		this.initDOM();
		this.canvas = document.getElementById('phonelock_canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = document.body.clientWidth;
		this.canvas.height = document.body.clientWidth;
		this.lastPoint = [];
		this.touchFlag = false;
		this.createCircles();
		this.initState();
		this.bindEvent();
	}

	/**
	 * [initPassword localStorage.touchpw的字符串转为object]
	 * @Sangle
	 * @DateTime 2017-03-29T11:29:32+0800
	 * @param    {[string]}                 pwindex [localStorage.touchpw]
	 * @return   {[array]}                         
	 */
	initPassword(pwindex) {
		return pwindex.split(',').map(function(elem) {
			return {
				index: elem
			}
		})
	}

	/**
	 * [initDOM 初始化DOM]
	 * @Sangle
	 * @DateTime 2017-03-29T11:35:26+0800
	 */
	initDOM() {
		const _dom = document.createElement('div'),
			str = '<header id="phonelock_title" style="color:' + this.textColor + '">绘制解锁图案</header>' +
			'<a id="phonelock_updatePassword">重置密码</a>' +
			'<canvas id="phonelock_canvas" style="display: inline-block;"></canvas>';
		_dom.setAttribute('style', 'position: relative;height:100%;width:100%;background-color:' + this.bgColor);
		_dom.innerHTML = str;
		document.body.appendChild(_dom);
	}

	/**
	 * [createCircles 根据画布大小画9个圆圈]
	 * @Sangle
	 * @DateTime 2017-03-29T11:35:55+0800
	 * @r 圆的半径
	 */
	createCircles() {
			let num = 0;
			this.r = this.ctx.canvas.width * 0.08;
			this.lastPoint = [];
			this.circles = [];
			this.restPoint = [];
			const r = this.ctx.canvas.width / 10;
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					num++;
					let obj = {
						x: (j + 1) * 3 * r - r,
						y: (i + 1) * 3 * r - r,
						index: num
					};
					this.circles.push(obj);
					this.restPoint.push(obj);
				}
			}
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			for (let i = 0; i < this.circles.length; i++) {
				this.drawCircle(this.circles[i].x, this.circles[i].y)
			}
		}
		/**
		 * [drawCircle 画一个圆]
		 * @Sangle
		 * @DateTime 2017-03-29T11:36:42+0800
		 * @param    {[number]}                 x [圆心坐标X]
		 * @param    {[number]}                 y [圆心坐标Y]
		 */
	drawCircle(x, y) {
		this.ctx.beginPath();
		this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 1;
		this.ctx.stroke();
	}

	/**
	 * [drawPoint 在经过的路径上的大圆里画小圆]
	 * @Sangle
	 * @DateTime 2017-03-29T11:38:05+0800
	 * @param    {[number]}                 x [圆心坐标X]
	 * @param    {[number]}                 y [圆心坐标Y]
	 */
	drawPoint(x, y) {
		for (let i = 0; i < this.lastPoint.length; i++) {
			this.ctx.beginPath();
			this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
			this.ctx.fillStyle = this.emphasizeColor;
			this.ctx.fill();
		}
	}

	/**
	 * [initState 初始化密码状态]
	 * @Sangle
	 * @DateTime 2017-03-29T11:40:27+0800
	 */
	initState() {
		if (this.passwordObj.step == 2) {
			document.getElementById('phonelock_updatePassword').style.display = 'block';
			document.getElementById('phonelock_title').innerHTML = '请解锁';
		} else {
			document.getElementById('phonelock_updatePassword').style.display = 'none';
		}
	}

	/**
	 * [bindEvent 绑定事件]
	 * @Sangle
	 * @DateTime 2017-03-29T11:40:51+0800
	 */
	bindEvent() {
		let _title = document.getElementById('phonelock_title');
		/*如果touchstart事件在圆内，将该圆添加到lastPoint，画出圆心*/
		this.canvas.addEventListener("touchstart", (e) => {
			e.preventDefault();
			let position = this.getPosition(e);
			for (let i = 0; i < this.circles.length; i++) {
				if (Math.abs(position.x - this.circles[i].x) < this.r && Math.abs(position.y - this.circles[i].y) < this.r) {
					this.touchFlag = true;
					this.lastPoint.push(this.circles[i]);
					this.drawPoint(this.circles[i].x, this.circles[i].y);
					this.restPoint.splice(i, 1);
					_title.innerHTML = '完成后松开手指'
				}
			}
		});
		this.canvas.addEventListener("touchmove", (e) => {
			e.preventDefault();
			if (this.touchFlag) {
				this.update(this.getPosition(e));
			}
		});
		this.canvas.addEventListener("touchend", () => {
			if (this.touchFlag) {
				this.touchFlag = false;
				if (this.lastPoint.length < 5 && this.passwordObj.step !== 1 && this.passwordObj.step !== 2) {
					_title.innerHTML = '至少需连接5个点<br>请重试'
					setTimeout(() => {
						this.reset();
					}, 300);
				} else {
					this.storePass(this.lastPoint);
					setTimeout(() => {
						this.reset();
					}, 300);
				}
			}
		});
		document.getElementById('phonelock_updatePassword').addEventListener('click', () => {
			this.updatePassword();
		});
	}

	/**
	 * [update 随手指移动更新数据]
	 * @Sangle
	 * @DateTime 2017-03-29T11:41:29+0800
	 * @param    {[object]}                 po [{x:x,y:y}]
	 */
	update(po) {
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

			for (let i = 0; i < this.circles.length; i++) {
				this.drawCircle(this.circles[i].x, this.circles[i].y);
			}

			this.drawPoint(this.lastPoint);
			this.drawLine(po, this.lastPoint);

			for (let i = 0; i < this.restPoint.length; i++) {
				if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
					this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
					this.lastPoint.push(this.restPoint[i]);
					this.restPoint.splice(i, 1);
				}
			}
		}
		/**
		 * [getPosition 获取手指位置]
		 * @Sangle
		 * @DateTime 2017-03-29T11:43:44+0800
		 * @param    {[object]}                 e [event]
		 * @return   {[object]}                   [{x:x,y:y}]
		 */
	getPosition(e) {
		const rect = this.canvas.getBoundingClientRect();
		return {
			x: e.touches[0].clientX - rect.left,
			y: e.touches[0].clientY - rect.top
		};
	}

	/**
	 * [drawLine 连接圆心画线]
	 * @Sangle
	 * @DateTime 2017-03-29T11:44:18+0800
	 * @param    {[object]}                 po        [{x:x,y:y}]
	 * @param    {[object]}                 lastPoint 
	 */
	drawLine(po, lastPoint) {
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'white'
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
		for (let i = 1; i < this.lastPoint.length; i++) {
			this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
		}
		this.ctx.lineTo(po.x, po.y);
		this.ctx.stroke();
	}

	/**
	 * [storePass 储存密码]
	 * @Sangle
	 * @DateTime 2017-03-29T11:45:20+0800
	 * @param    {[array]}                 pw [object]
	 */
	storePass(pw) {
		const _title = document.getElementById('phonelock_title')
		if (this.passwordObj.step == 1) {
			if (this.checkPass(this.passwordObj.password, pw)) {
				localStorage.touchpw = pw.map(function(elem) {
					return elem.index
				});
				localStorage.step = 2;
				this.passwordObj.step = 2;
				_title.innerHTML = '密码保存成功';
				this.drawStatusPoint(this.corrrectColor);
			} else {
				_title.innerHTML = '图案错误，请重新输入';
				setTimeout(() => {
					_title.innerHTML = '绘制解锁图案'
				}, 500)
				this.drawStatusPoint(this.warningColor);
				this.passwordObj.step = 0;
				localStorage.step = 0;
			}
		} else if (this.passwordObj.step == 2) {
			if (this.checkPass(this.passwordObj.password, pw)) {
				_title.innerHTML = '解锁成功';
				this.drawStatusPoint(this.corrrectColor);
			} else {
				this.drawStatusPoint(this.warningColor);
				_title.innerHTML = '解锁失败';
			}
		} else {
			this.passwordObj.step = 1;
			localStorage.step = 1;
			this.passwordObj.password = pw;
			_title.innerHTML = '再次绘制图案进行确认';
		}
	}

	/**
	 * [checkPass 检测密码输入是否正确]
	 * @Sangle
	 * @DateTime 2017-03-29T11:46:27+0800
	 * @param    {[array]}                 pw1 
	 * @param    {[array]}                 pw2 
	 * @return   {[boolean]}                    
	 */
	checkPass(pw1, pw2) {
		let p1 = '',
			p2 = '';
		for (let i = 0; i < pw1.length; i++) {
			p1 += pw1[i].index
		}
		for (let i = 0; i < pw2.length; i++) {
			p2 += pw2[i].index
		}
		return p1 === p2;
	}

	/**
	 * [drawStatusPoint 根据输入是否正确改变画线颜色]
	 * @Sangle
	 * @DateTime 2017-03-29T11:47:12+0800
	 * @param    {[string]}                 color [color]
	 */
	drawStatusPoint(color) {
		for (let i = 0; i < this.lastPoint.length; i++) {
			this.ctx.strokeStyle = color;
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
			this.ctx.stroke();
		}
	}

	/**
	 * [updatePassword 重置密码]
	 * @Sangle
	 * @DateTime 2017-03-29T11:47:55+0800
	 */
	updatePassword() {
		this.passwordObj = {};
		document.getElementById('phonelock_title').innerHTML = '绘制解锁图案';
		this.reset();
	}

	/**
	 * [reset 重置DOM和密码]
	 * @Sangle
	 * @DateTime 2017-03-29T11:48:13+0800
	 */
	reset() {
		this.initState();
		this.createCircles();
	}
}