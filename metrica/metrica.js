
function initMetrica() {
	let cursor = $("#fake-cursor"),
		touchPoints = [],
		interval = 30,
		mouseX = 0, mouseY = 0,
		mouseCoords = [],
		isRecording = false,
		coordsIndex,
		clicks = [],
		taps = [],
		recordTime,
		playingTime,
		mouseInterval,
		playingInterval,
		recordingStart,
		recordingDuration,
		currentClick = 0,
		curTap = 0,
		timesGone = 0,
		scrolls = [],
		ongoingTouches = [],
		touches = [],
		curTouches = [],
		currentScrolls = 0;

	const startRecording = () => {
		recordTime = 0
		isRecording = true
		clicks = []
		mouseCoords = []
		scrolls = []
		ongoingTouches = []
		recordingStart = Date.now()
		mouseInterval = setInterval(() => {
			mouseCoords.push({ left: mouseX, top: mouseY })
			touches.push(ongoingTouches)
		}, interval)
	}

	const triggerScrolls = () => {
		setTimeout(() => {
			let cur = scrolls[currentScrolls],
				el
			if (cur.y > 0) {
				el = $("." + cur.class.trim().replace(/ /ig, '.'))
			} else {
				el = $(window)
			}
			el.scrollTop(cur.scrollTop)
			el.scrollLeft(cur.scrollLeft)
			currentScrolls++
			if (currentScrolls < scrolls.length) {
				triggerScrolls()
			}
		},currentScrolls ? scrolls[currentScrolls].time - scrolls[currentScrolls - 1].time : scrolls[currentScrolls].time)
	}

	const triggerClicks = () => {
		setTimeout(() => {
			let el = $(document.elementFromPoint(clicks[currentClick].x, clicks[currentClick].y))
			if (el.attr("id") !== "save-to-file") {
				el.trigger('mousedown')
				el.trigger('mouseup')
				el.trigger('click')
			}
			console.log('click')
			console.log(el.eq(0))
			currentClick++
			if (currentClick < clicks.length) {
				triggerClicks()
			}
		},currentClick ? clicks[currentClick].time - clicks[currentClick - 1].time : clicks[currentClick].time)
	}

	const triggerTaps = () => {
		setTimeout(() => {
			let el = $(document.elementFromPoint(taps[curTap].x, taps[curTap].y))
			if (el.attr("id") !== "save-to-file") {
				el.trigger('mousedown')
				el.trigger('mouseup')
				el.trigger('click')
			}
			console.log('tap')
			console.log(el.eq(0))
			curTap++
			if (curTap < taps.length) {
				triggerTaps()
			}
		},curTap ? taps[curTap].time - taps[curTap - 1].time : taps[curTap].time)
	}

	const stopRecording = () => {
		clearInterval(mouseInterval)
		if (isRecording) {
			recordingDuration = Date.now() - recordingStart
		}
		isRecording = false
		console.log(clicks)
		console.log(touches)
		console.log(mouseCoords)
		console.log(recordingDuration);
	}

	function writeFile(name, value) {
		let val = value;
		if (value === undefined) {
			val = "";
		}
		let download = document.createElement("a");
		download.href = "data:text/plain;content-disposition=attachment;filename=file," + val;
		download.download = name;
		download.style.display = "none";
		download.id = "download"; document.body.appendChild(download);
		document.getElementById("download").click();
		document.body.removeChild(download);
	}

	const playRecord = () => {
		let touchesLength = 0

		cursor.show();
		playingTime = 0
		coordsIndex = 0
		currentClick = 0
		timesGone = 0
		currentScrolls = 0
		curTap = 0

		playingInterval = setInterval(() => {
			cursor.offset(mouseCoords[coordsIndex])
			curTouches = touches[coordsIndex]
			if (curTouches) {
				if (touchesLength !== curTouches.length) {
					touchesLength = curTouches.length
					touchPoints.forEach((el, index) => {
						if (index < touchesLength) {
							el.show()
						} else {
							el.hide()
						}
					})
				}
				curTouches.forEach((el, index) => {
					//touchPoints[index].offset({top: el.clientY, left: el.clientX })
					touchPoints[index].css('top', el.clientY );
					touchPoints[index].css('left', el.clientX );
					touchPoints[index].css('width', el.width );
					touchPoints[index].css('height', el.height );
					if (el.rotationAngle) {
						touchPoints[index].css('transform', 'rotate(' + el.rotationAngle + 'deg)' );
					}
				})
			}
			coordsIndex++
			playingTime += interval
			if (playingTime >= recordingDuration) {
				clearInterval(playingInterval)
				cursor.hide()
			}
		},interval)
		if (clicks.length) {
			triggerClicks()
		}
		if (taps.length) {
			triggerTaps()
		}
		if (scrolls.length) {
			triggerScrolls()
		}
	}

	function initTouches() {
		//document.addEventListener("touchstart", handleStart, false);
		document.addEventListener("touchend", handleEnd, false);
		document.addEventListener("touchcancel", handleCancel, false);
		document.addEventListener("touchmove", handleMove, false);
	}

	function handleStart(evt) {
		let touches = evt.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			ongoingTouches.push(copyTouch(touches[i]));
		}
	}

	function copyTouch({ identifier, clientX, clientY }) {
		return { identifier, clientX, clientY };
	}

	function handleMove(evt) {
		let touches = evt.changedTouches,
			touch;
			ongoingTouches = []

		for (let i = 0; i < touches.length; i++) {
			touch = touches.item(i);
			ongoingTouches.push({
				clientX: Math.round(touch.clientX),
				clientY: Math.round(touch.clientY),
				width: Math.round(touch.radiusX ? ( touch.radiusX > 3 ? touch.radiusX*2 : (touch.radiusX*20)) : 20),
				height: Math.round(touch.radiusY ? ( touch.radiusY > 3 ? touch.radiusY*2 : (touch.radiusY*20)) : 20),
				rotationAngle: Math.round(touch.rotationAngle)
			})
			/*let idx = ongoingTouchIndexById(touches[i].identifier);
			if (idx >= 0) {
				ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
			}*/
		}
	}

	function handleEnd() {
		ongoingTouches.splice(0, 1);
		console.log(ongoingTouches)
	}

	function handleCancel() {
		ongoingTouches.splice(0, 1);
	}

	function ongoingTouchIndexById(idToFind) {
		for (let i = 0; i < ongoingTouches.length; i++) {
			let id = ongoingTouches[i].identifier;

			if (id == idToFind) {
				return i;
			}
		}
		return -1;    // not found
	}

	return {
		delegateEvents: function () {
			/*Object.keys(window).forEach(key => {
				if (/^on/.test(key)) {
					window.addEventListener(key.slice(2), event => {
						console.log(event);
					});
				}
			});*/

			for (let i = 1; i < 11; i++) {
				touchPoints.push($("#touch" + i))
			}

			initTouches()

			$("#start-recoding").click(function () {
				startRecording()
			})

			$("#save-to-file").click(function () {
				stopRecording()
				writeFile("events.txt", JSON.stringify({
					interval: interval,
					duration: recordingDuration,
					clientInfo: {

					},
					events: {
						mouseMove: mouseCoords,
						clicks: clicks,
						scrolls: scrolls,
						taps: taps,
						touches: touches
					}
				}));
			})

			$("#stop-recoding").click(function () {
				stopRecording()
				console.log(clicks);
				console.log(scrolls);
			})

			$("#events-file").change(function (e) {
				let file = e.target.files[0];

				let reader = new FileReader();

				reader.readAsText(file);

				reader.onload = function() {
					let eventsOjb = JSON.parse(reader.result)
					console.log('file ' + file.name +  ' ready');
					console.log(eventsOjb)
					mouseCoords = eventsOjb.events.mouseMove
					recordingDuration = eventsOjb.duration
					clicks = eventsOjb.events.clicks
					scrolls = eventsOjb.events.scrolls
					touches = eventsOjb.events.touches
					taps = eventsOjb.events.taps
					playRecord()
				};

				reader.onerror = function() {
					console.log(reader.error);
				};
			})

			$("#repeat-user-actions").click(function () {
				playRecord()
			})

			$(document).mousemove(function (e) {
				mouseX = e.clientX
				mouseY = e.clientY
			})

			$(document).mousedown(function (e) {
				if (isRecording) {
					console.log(e)
					if (e.target.tagName === 'circle' || e.target.tagName === 'svg' || e.target.tagName === 'path') {
						clicks.push({
							//el:  $(e.target.closest('button')),
							time: Date.now() - recordingStart,
							x: e.clientX,
							y: e.clientY
						})
					} else {
						clicks.push({
							time: Date.now() - recordingStart,
							x: e.clientX,
							y: e.clientY
						})
					}
				}
			})

			$(window).scroll(function (e) {
				if (isRecording) {
					scrolls.push({
						x: 0,
						y: 0,
						scrollTop: window.pageYOffset,
						scrollLeft: window.pageXOffset,
						time: Date.now() - recordingStart
					})
				}
			})

			$("div").scroll(function (e) {
				if (isRecording) {
					let el = $(e.currentTarget),
						y = el.offset().top - window.pageYOffset,
						x = el.position().left - window.pageXOffset
					scrolls.push({
						x: x < 1 ? 1 : x + 1,
						y: y < 1 ? 1 : y + 1,
						class: el.attr("class"),
						scrollTop: el.scrollTop(),
						scrollLeft:  el.scrollLeft(),
						time: Date.now() - recordingStart
					})
				}
			})

			$(document).on("tap",function(e){
				if (isRecording) {
					console.log(e)
					if (e.target.tagName === 'circle' || e.target.tagName === 'svg' || e.target.tagName === 'path') {
						taps.push({
							time: Date.now() - recordingStart,
							x: e.clientX,
							y: e.clientY
						})
					} else {
						taps.push({
							time: Date.now() - recordingStart,
							x: e.clientX,
							y: e.clientY
						})
					}
				}
			});

		}
	}
}

$(document).ready(function () {
	$("body").append(`
				<div id="metrica-mya">
					<div id="fake-cursor"></div>
					<div id="touch1" class="animated-touch"></div>
					<div id="touch2" class="animated-touch"></div>
					<div id="touch3" class="animated-touch"></div>
					<div id="touch4" class="animated-touch"></div>
					<div id="touch5" class="animated-touch"></div>
					<div id="touch6" class="animated-touch"></div>
					<div id="touch7" class="animated-touch"></div>
					<div id="touch8" class="animated-touch"></div>
					<div id="touch9" class="animated-touch"></div>
					<div id="touch10" class="animated-touch"></div>
					<div id="save-stats">
						<span id="start-recoding">start</span>
						<span id="save-to-file">save</span>
					</div>
					<div id="play-stats">
						<input type="file" id="events-file" name="events-file" accept="text/plain">
					</div>
				</div>
				<style>
					.user-actions {
						position: absolute;
						top: 5rem;
						left: 37rem;
						font-size: 2rem;
					}

					.user-actions span {
						margin-left: 1rem;
					}

					.user-actions span {
						cursor: pointer;
					}

					#fake-cursor {
						position: fixed;
						height: 1rem;
						width: 1rem;
						border-radius: 50%;
						background-color: black;
						display: none;
						z-index: 999999999999999999999;
					}

					#save-stats {
						position: fixed;
						background-color: black;
						color: white;
						font-size: 18px;
						z-index: 999999999999999999999;
						padding: 0.5em 1em;
						cursor: pointer;
						border-bottom-right-radius: 5px;
						top: 0;
						left: 0;
					}

					#save-stats span {
						margin-right: 1em;
					}

					#save-stats span:last-child {
						margin-right: 0;
					}

					#play-stats {
						position: fixed;
						background-color: black;
						color: white;
						font-size: 18px;
						top: 3rem;
						z-index: 999999999999999999999;
						padding: 0.5em 1em;
						cursor: pointer;
						border-bottom-left-radius: 5px;
						right: 0;
					}

					#play-stats span {
						margin-right: 1em;
					}

					#play-stats span:last-child {
						margin-right: 0;
					}

					.animated-touch {
						position: fixed;
						height: 20px;
						width: 20px;
						display: none;
						border-radius: 50%;
						background-color: black;
						transition: 0.03s;
						z-index: 999999999999999999999;
					}
				</style>
			`)

	initMetrica().delegateEvents()
})
