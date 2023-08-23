// -------- Load Js for Page
const pages = {
	home: loadHomePageAnim,
	about: loadAboutPageAnim,
};
function pageLoad() {
	window.scrollTo(0,0);
	setHeadingAnim();
	const pageLoadFunc = pages[document.querySelector("main").id];
	pageLoadFunc && pageLoadFunc();
	document.body.style.opacity = 1;
}
pageLoad();

//---------- Page Transition Barba.js
barba.init({
	sync: true,
	transitions: [
		{
			async leave(data) {
				const done = this.async();
				gsap.timeline()
					.set(".bar", { visibility: "visible" })
					.to(".bar", {
						yPercent: -100,
						stagger: 0.1,
						ease: "expo.inOut",
						duration: 0.4,
						onComplete: () => done(),
					})
					.to(".bar", {
						yPercent: 0,
						stagger: 0.1,
						ease: "expo.inOut",
						duration: 1.5,
					})
					.set(".bar", { visibility: "hidden" });
			},
		},
	],
});
barba.hooks.afterLeave(() => {
	let triggers = ScrollTrigger.getAll();
	triggers.forEach((trigger) => {
		trigger.kill();
	});
});
barba.hooks.after((data) => {
	pageLoad();
});

//--------- Handle Navigation links and Menu
const navLinks = document.querySelectorAll(".nav-link");
const menu_container = document.querySelector(".menu-container");
const menuIcon = document.querySelector(".menu-icon");

const menuAnimTl = gsap
	.timeline()
	.set(menu_container, { visibility: "visible" })
	.set(".menu-bg", { visibility: "visible" })
	.fromTo(
		".menu-bg",
		{
			scale: 0
		},
		{scale: 1}
	)
	.fromTo(
		".menu-container .nav-link",
		{
			xPercent: 50,
			opacity: 0,
		},
		{
			xPercent: 0,
			stagger: 0.1,
			opacity: 1,
			ease: "back.out",
		},0
	)
	.pause();
menuIcon.addEventListener("click", () => {
	const active = menuIcon.classList.toggle("active");
	active ? menuAnimTl.play() : menuAnimTl.reverse();
});

let linkActive = document.querySelector(".active");
navLinks.forEach((link) => {
	link.addEventListener("click", () => {
		linkActive && linkActive.classList.remove("active");
		linkActive = link;
		link.classList.add("active");
		menuIcon.classList.remove("active");
		menuAnimTl.reverse();
	});
});

//--------- Light Dark Mode
const mode = localStorage.getItem("mode");
if (mode) document.body.classList.add(mode);
document.getElementById("bulb").addEventListener("click", (e) => {
	const mode = localStorage.getItem("mode");
	if (mode !== "dark-mode") {
		localStorage.setItem("mode", "dark-mode");
		document.body.classList.add("dark-mode");
	} else {
		localStorage.setItem("mode", "light-mode");
		document.body.classList.remove("dark-mode");
	}
});

// --------- HOME PAGE --------------- //
function loadHomePageAnim() {
	//------------- Loading Animation (Starting) ------------------
	split("[data-heading]");
	const onLoadAnim = gsap.timeline({ defaults: { duration: 1 } });
	onLoadAnim
		.set(
			"#carousal-circle",
			{
				visibility: "visible",
			},
			0
		)
		.fromTo(
			"[data-heading] .char",
			{
				opacity: 0,
				yPercent: 100,
			},
			{
				opacity: 1,
				yPercent: 0,
				stagger: 0.04,
				ease: "back.out",
			},
			0.5
		)
		.fromTo(
			"#path-container",
			{
				overflow: "hidden",
				height: "0",
			},
			{
				height: "auto",
				ease: "sine.in",
			},
			1
		);

	//---------- IMAGE Carousal Animation ---------------------
	const carousal_images = gsap.utils.toArray(".carousal-image");

	const duration = 0.5;
	const snapImagesTl = gsap
		.timeline({
			paused: true,
			defaults: { ease: "sine.out", duration: duration },
		})
		.from("#carousal-images", {
			left: "0%",
			gap: "10%",
		})
		.to("#carousal-images", {
			left: "-110%",
		})
		.to(
			".carousal-image",
			{
				transform: "rotate(7deg)",
			},
			0
		)
		// Hide the prev img container
		.to("#carousal-images", {
			opacity: "0",
			yPercent: -100,
		});

	gsap.set("#carousal-circle", {
		xPercent: -60,
		yPercent: -50,
	});

	const endOfCarousal = "bottom top";
	const carousalTimeline = gsap
		.timeline({
			scrollTrigger: {
				trigger: "#hero-section",
				scrub: 2,
				start: "top top",
				end: endOfCarousal,
				onEnter: () => snapImagesTl.tweenTo(duration * 2),
				onLeave: () => snapImagesTl.tweenTo("end"),
				onEnterBack: () => snapImagesTl.tweenTo(duration * 2),
				onLeaveBack: () => snapImagesTl.tweenTo(0),
			},
			defaults: {
				duration: 6,
				rotation: 0.1,
				force3D: true,
			},
		})
		.to("#carousal-circle", {
			immediateRender: true,
			motionPath: { path: "#path", align: "#path", start: 0.48 },
		})

	//---------- BENEFITS section Animation -----------------------
	const list_items = gsap.utils.toArray("#benefits-list .list-item");
	const benefits_images = gsap.utils.toArray(
		"#benefits-images .carousal-image"
	);

	function goToItem(i) {
		const item = list_items[i];
		item.querySelector("[data-split]").classList += " clip-below-text";
		const isFirstItem = i === 0;
		const tl = gsap
			.timeline({ defaults: { duration: 1, ease: "back.out" } })
			.fromTo(
				item.querySelectorAll(".char"),
				{
					yPercent: !isFirstItem && 60,
				},
				{
					yPercent: 0,
				}
			)
			.to(
				"#benefits-list",
				{
					y: -item.offsetHeight * i,
				},
				0
			)
			.to(
				"#benefits-images",
				{
					xPercent: -110 * i,
					ease: "sine.inOut",
				},
				0
			);
	}

	// Create Trigger for each Item
	let gap = 260; //value in px scroll needed to get next item
	let start = 0;
	let end = gap;
	list_items.forEach((item, i) => {
		ScrollTrigger.create({
			trigger: item,
			start: start + " center",
			end: end + item.offsetHeight + " center",
			onToggle: (self) => self.isActive && goToItem(i),
		});
		start = end;
		end += gap;
	});

	// Pin the pinned-section container and make Benefit img visible
	const anim = gsap.timeline().fromTo(
		"#benefits-images",
		{
			opacity: 0,
			yPercent: 110,
		},
		{
			opacity: 1,
			yPercent: 0,
			duration: 0.5,
		}
	);

	const offset = window.innerHeight;
	ScrollTrigger.create({
		animation: anim,
		toggleActions: "play resume none reverse",
		trigger: "#section-benefits",
		start: "center center",
		end: "+=" + (end + offset), //unpin when done
		pin: "#pinned-section",
		refreshPriority: 1,
	});

	// ------------- "Who Can BENEFIT" section ------------------
	const section_items = gsap.utils.toArray(
		".section-who-can-benefit .list-item"
	);

	section_items.forEach((item, i) => {
		gsap.timeline().to(item, {
			keyframes: {
				scale: [1, 2.1, 1],
				opacity: [0.3, 1, 0.3],
			},
			ease: "sine.out",
			transformOrigin: "center left",
			scrollTrigger: {
				trigger: item,
				start: "center center",
				end: "bottom top",
				scrub: 0.5,
			},
		})
		.to({}, 2, {});
	});

	//------------- SERVICES Section ------------------
	const services = document.getElementById("section-services");
	const item_container = services.querySelector(".services-content");
	const services_imgs = item_container.querySelectorAll(".service-item img");
	const explore_more = services.querySelector(".explore-services");
	services_imgs.forEach((img) => (img.draggable = false));

	setCustomSlider(services, item_container, [], explore_more);

	//------------- TESTIMONIAL Section ------------------
	gsap.utils
		.toArray(".testimonial-content .wrapper")
		.forEach((wrapper, index) => {
			const [x, xEnd] =
				index % 2
					? ["100%", (wrapper.scrollWidth - wrapper.offsetWidth) * -1]
					: [wrapper.scrollWidth * -1, 0];
			gsap.fromTo(
				wrapper,
				{ x },
				{
					x: xEnd,
					scrollTrigger: {
						trigger: wrapper,
						scrub: 1,
					},
				}
			);
		});

	//------------- SNAPSHOT Showcase Section ------------------
	const showcase = document.getElementById("section-showcase");
	const showcase_head = showcase.querySelector("#showcase-head");
	const showcase_img_container = showcase.querySelector("#showcase-images");
	const plusSign = document.getElementById("plus");

	const showcase_images = gsap.utils.toArray("#showcase-images img");

	showcase_head.addEventListener("click", () => {
		// Slider Functionality for Showcase Images
		const track = showcase.querySelector("[data-track]");
		setCustomSlider(showcase, track, showcase_images, plusSign);

		// Animation
		gsap.set(showcase_img_container, { visibility: "visible", opacity: 0 });
		gsap.timeline({
			defaults: {
				duration: 2.5,
			},
		})
			.to(
				showcase_head,
				{
					xPercent: -100,
					opacity: 0,
				},
				0
			)
			.to(
				showcase_head.querySelectorAll(".char"),
				{
					yPercent: -100,
					stagger: 0.1,
				},
				0
			)
			.set(showcase_head, { visibility: "hidden" })
			.fromTo(
				showcase_img_container,
				{
					xPercent: 100,
				},
				{
					xPercent: 0,
					opacity: 1,
					ease: "power4.out",
				},
				0
			)
			.to(
				plusSign,
				{
					y: -showcase_img_container.offsetHeight / 2,
					x: -window.innerWidth / 4,
					rotate: 0,
					opacity: 0.6,
				},
				0
			);
	});

	// ------------ INFO Section ------------------
	const infoScrollTl = gsap
		.timeline({
			duration: 2,
			scrollTrigger: {
				trigger: "#section-info",
				start: "top center",
				toggleActions: "play none none reverse",
			},
		})
		.to(
			"#section-info .map",
			{
				transform: "rotateX(70deg) rotateZ(-60deg)",
			},
			0
		)
		.to(
			"#location-dot",
			{
				top: "42%",
				right: "6%",
			},
			0
		)
		.to("#gmap", {
			opacity: 1,
		},.5)
}

// --------- ABOUT PAGE --------------- //
function loadAboutPageAnim() {
	// Starting Anim
	const section_about = document.getElementById("section-about");
	gsap.fromTo(
		".abt-heading .word",
		{
			opacity: 0,
			yPercent: 100,
		},
		{
			opacity: 1,
			yPercent: 0,
			stagger: 0.2,
			delay: 1,
		}
	);
	gsap.to(".abt-img-container .img1", {
		delay: 1,
		scale: 1.2,
		duration: 2,
	});
	const about_item = gsap.utils.toArray(".abt-item");

	const scrollTween = gsap
		.timeline({
			ease: "none",
			scrollTrigger: {
				trigger: "#section-about",
				start: "-12% top",
				end: `=+${section_about.scrollWidth}`,
				scrub: 1.5,
				pin: "#section-about",
			},
		})
		.to("#section-about", {
			x: -section_about.scrollWidth + window.innerWidth / 1.2,
		});

	about_item.forEach((item, i) => {
		gsap.timeline({
			scrollTrigger: {
				trigger: item,
				containerAnimation: scrollTween,
				start: "left right",
				toggleActions: "play none none reverse",
			},
		})
		.fromTo(
			item.querySelector(".abt-content"),
			{
				opacity: 0,
				yPercent: 10,
			},
			{
				opacity: 1,
				yPercent: 0,
				duration: 1,
			},
			.5	
		);
	});
}

// ------------ All Headings Anim ------------------
function setHeadingAnim() {
	// Split all Required words for ScrollTrigger
	split("[data-split]");

	const headings = gsap.utils.toArray(".section-heading");
	headings.forEach((heading, i) => {
		gsap.fromTo(
			heading.querySelectorAll(".char"),
			{
				yPercent: 100,
			},
			{
				yPercent: 0,
				stagger: 0.02,
				scrollTrigger: {
					trigger: heading,
					start: "top center",
				},
			}
		);
	});
	// Sorting acc to refresh priority
	ScrollTrigger.sort();
}

// ----------- Mouse Cursor -------------------
function setCustomCursor(ball) {
	gsap.set(ball, { xPercent: -50, yPercent: -50, display: "block" });
	const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	const mouse = { x: pos.x, y: pos.y };
	const speed = 0.2;

	const xSet = gsap.quickSetter(ball, "x", "px");
	const ySet = gsap.quickSetter(ball, "y", "px");

	window.addEventListener("mousemove", (e) => {
		mouse.x = e.x;
		mouse.y = e.y;
	});

	gsap.ticker.add(() => {
		// adjust speed for higher refresh monitors
		const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());

		pos.x += (mouse.x - pos.x) * dt;
		pos.y += (mouse.y - pos.y) * dt;
		xSet(pos.x);
		ySet(pos.y);
	});
}
const ball = document.getElementById("ball");
const mobile = /iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase());
if (!mobile) setCustomCursor(ball);

// ----------- Utility Func -------------------
function split(query) {
	const elements = document.querySelectorAll(query);
	elements.forEach((ele) => {
		ele.innerHTML = ele.innerText
			.split(" ")
			.map((word) => {
				const letters = word
					.split("")
					.map((letter) => `<span class="char">${letter}</span>`)
					.join("");

				return `<span class="word ${
					ele.dataset.colorWord === word ? "clr-primary" : ""
				}">${letters}&nbsp;</span>`;
			})
			.join("");
	});
}

function setCustomSlider(section, track, slider_images, moveForward) {
	slider_images.forEach((img) => (img.draggable = false)); //Prevent default behaviour
	track.dataset.mouseDownAt = "0";
	track.dataset.prevPercentage = "0";
	track.dataset.percentage = "0";

	const handleOnDown = (e) => (track.dataset.mouseDownAt = e.clientX);
	const handleOnUp = () => {
		track.dataset.mouseDownAt = "0";
		track.dataset.prevPercentage = track.dataset.percentage;
	};

	let xPercentTo = gsap.quickTo(track, "xPercent", {
		duration: 3,
		ease: "power3",
	});

	function moveTrackBy(percentage) {
		const nextPercentageUnconstrained =
				parseFloat(track.dataset.prevPercentage) + percentage,
			nextPercentage = Math.max(
				Math.min(nextPercentageUnconstrained, 0),
				-100
			);

		track.dataset.percentage = nextPercentage;

		xPercentTo(nextPercentage);
		// image parallex effect
		gsap.to(slider_images, {
			objectPosition: `${100 + nextPercentage}% 50%`,
			duration: 3,
			ease: "power3",
		});
	}

	const handleOnMove = (e) => {
		if (track.dataset.mouseDownAt === "0") return;

		const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
			maxDelta = Math.max(window.innerWidth, 1000);

		const percentage = (mouseDelta / maxDelta) * -100;
		moveTrackBy(percentage);
	};
	section.onmousedown = (e) => handleOnDown(e);
	section.ontouchstart = (e) => handleOnDown(e.touches[0]);

	section.onmouseup = (e) => handleOnUp(e);
	section.ontouchend = (e) => handleOnUp(e.touches[0]);

	section.onmousemove = (e) => handleOnMove(e);
	section.ontouchmove = (e) => handleOnMove(e.touches[0]);

	moveForward &&
		moveForward.addEventListener("click", () => {
			moveTrackBy(-10);
		});
}
