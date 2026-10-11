const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* cursor (только устройства с мышью) */
const cursor=document.querySelector('.cursor');
const dot=document.querySelector('.cursor-dot');
if(fine&&cursor&&dot){
    let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
    addEventListener('mousemove',e=>{
        mx=e.clientX;my=e.clientY;
        dot.style.left=mx+'px';dot.style.top=my+'px';
    });
    (function loop(){
        cx+=(mx-cx)*.14;cy+=(my-cy)*.14;
        cursor.style.left=cx+'px';cursor.style.top=cy+'px';
        requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,.project-hover,.magnetic').forEach(el=>{
        el.addEventListener('mouseenter',()=>cursor.classList.add('active'));
        el.addEventListener('mouseleave',()=>cursor.classList.remove('active'));
    });
    /* на цветных элементах курсор тёмный, без радужной инверсии */
    document.querySelectorAll('.btn-mail,.ico').forEach(el=>{
        el.addEventListener('mouseenter',()=>{cursor.classList.add('dark');dot.classList.add('dark')});
        el.addEventListener('mouseleave',()=>{cursor.classList.remove('dark');dot.classList.remove('dark')});
    });
    document.querySelectorAll('.project-hover').forEach(el=>{
        el.addEventListener('mouseenter',()=>cursor.classList.add('drag'));
        el.addEventListener('mouseleave',()=>cursor.classList.remove('drag'));
    });
}else{
    cursor?.remove();dot?.remove();
    document.body.style.cursor='auto';
}

/* mobile menu */
const menuBtn=document.querySelector('.menu-btn');
const mobileNav=document.querySelector('.mobile-nav');
const closeMenu=()=>{
    menuBtn.classList.remove('open');mobileNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');document.body.style.overflow='';
};
if(menuBtn&&mobileNav){
    menuBtn.addEventListener('click',()=>{
        const isOpen=menuBtn.classList.toggle('open');
        mobileNav.classList.toggle('open',isOpen);
        menuBtn.setAttribute('aria-expanded',isOpen);
        document.body.style.overflow=isOpen?'hidden':'';
    });
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
    /* поворот телефона или расширение окна: закрыть меню, чтобы не блокировать прокрутку */
    addEventListener('resize',()=>{if(innerWidth>900)closeMenu()});
}

/* header depth + scroll progress */
const headerEl=document.querySelector('header');
const bar=document.createElement('div');
bar.className='progress';document.body.prepend(bar);
const onScroll=()=>{
    headerEl.classList.toggle('scrolled',scrollY>40);
    const h=document.documentElement;
    bar.style.transform=`scaleX(${h.scrollTop/(h.scrollHeight-h.clientHeight||1)})`;
};
onScroll();
addEventListener('scroll',onScroll,{passive:true});

/* reveal */
const revealObs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target)}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

/* active nav link */
const links=[...document.querySelectorAll('.nav a')];
const secObs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting)links.forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+e.target.id));
}),{rootMargin:'-45% 0px -50% 0px'});
links.forEach(a=>{const s=document.querySelector(a.getAttribute('href'));if(s)secObs.observe(s)});

/* count-up */
const countObs=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target,end=+el.dataset.count,suf=el.dataset.suffix||'';
    countObs.unobserve(el);
    if(reduce){el.textContent=end+suf;return}
    const t0=performance.now();
    const tick=t=>{
        const p=Math.min((t-t0)/1200,1);
        el.textContent=Math.round(end*(1-Math.pow(1-p,3)))+suf;
        if(p<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>countObs.observe(el));

if(fine&&!reduce){
    /* magnetic links: лёгкий сдвиг за курсором. Центр считаем без учёта текущего сдвига,
       чтобы элемент не «убегал» из-под курсора и не дёргался */
    document.querySelectorAll('.magnetic').forEach(el=>{
        let x=0,y=0,tx=0,ty=0,raf=0;
        const MAX=6;
        const clamp=v=>Math.max(-MAX,Math.min(MAX,v));
        const step=()=>{
            x+=(tx-x)*.1;y+=(ty-y)*.1;
            el.style.transform=`translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
            if(Math.abs(tx-x)>.05||Math.abs(ty-y)>.05){raf=requestAnimationFrame(step)}
            else{raf=0;if(!tx&&!ty)el.style.transform=''}
        };
        const run=()=>{if(!raf)raf=requestAnimationFrame(step)};
        el.addEventListener('mousemove',e=>{
            const r=el.getBoundingClientRect();
            const cx=r.left+r.width/2-x, cy=r.top+r.height/2-y;
            tx=clamp((e.clientX-cx)*.06);
            ty=clamp((e.clientY-cy)*.06);
            run();
        });
        el.addEventListener('mouseleave',()=>{tx=0;ty=0;run()});
    });

    /* hero parallax */
    const title=document.querySelector('.hero-title');
    const img=document.querySelector('.hero-image');
    if(title&&img&&innerWidth>900){
        let tx=0,ty=0,px=0,py=0,gx=0,gy=0;
        addEventListener('mousemove',e=>{
            gx=(e.clientX/innerWidth-.5)*2;gy=(e.clientY/innerHeight-.5)*2;
        });
        (function loop(){
            px+=(gx-px)*.06;py+=(gy-py)*.06;
            title.style.transform=`translate(calc(-50% + ${px*-14}px),calc(-50% + ${py*-8}px))`;
            img.style.transform=`translate(${px*10}px,${py*6}px)`;
            requestAnimationFrame(loop);
        })();
    }
}

/* keyboard easter egg: wargen */
let typed='';
addEventListener('keydown',e=>{
    if(!e.key||e.key.length!==1)return;
    typed=(typed+e.key.toLowerCase()).slice(-6);
    if(typed==='wargen'){
        document.body.animate(
            [{filter:'invert(0)'},{filter:'invert(1)'},{filter:'invert(0)'}],
            {duration:650,easing:'ease-out'}
        );
    }
});


/* ===== motion+ (добавлено): живое движение на телефоне и у проектов ===== */
(()=>{
    if(reduce)return;
    const $=s=>document.querySelector(s);
    const $$=s=>[...document.querySelectorAll(s)];
    const once=fn=>{let t=0;return()=>{if(t)return;t=requestAnimationFrame(()=>{t=0;fn()})}};

    /* название проекта плавно «едет» вбок при прокрутке (везде) */
    const names=$$('.case-name');
    const slide=once(()=>{
        const vh=innerHeight,k=Math.min(innerWidth,900)*.035;
        names.forEach(el=>{
            const r=el.getBoundingClientRect();
            if(r.bottom<0||r.top>vh)return;
            const p=(r.top+r.height/2)/vh-.5;
            el.style.transform=`translateX(${(p*2*k).toFixed(1)}px)`;
        });
    });
    addEventListener('scroll',slide,{passive:true});
    addEventListener('resize',slide);
    slide();

    if(fine){
        /* ПК: проекты слегка наклоняются за курсором */
        $$('.case-visual').forEach(el=>{
            el.addEventListener('mousemove',e=>{
                const r=el.getBoundingClientRect();
                const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
                el.style.transform=`perspective(900px) rotateY(${(x*6).toFixed(2)}deg) rotateX(${(-y*6).toFixed(2)}deg)`;
            });
            el.addEventListener('mouseleave',()=>{el.style.transform=''});
        });
    }else{
        /* телефон/планшет: параллакс героя от прокрутки (вместо мыши) */
        const title=$('.hero-title'),img=$('.hero-image');
        if(title&&img){
            const par=once(()=>{
                const y=scrollY;
                if(y>innerHeight*1.3)return;
                title.style.transform=`translate(-50%,calc(-50% + ${(y*.15).toFixed(1)}px))`;
                img.style.transform=`translateY(${(y*.08).toFixed(1)}px)`;
            });
            addEventListener('scroll',par,{passive:true});
            par();
        }
        /* волна от короткого касания (прокрутка пальцем её не вызывает) */
        let sx=0,sy=0,st=0;
        addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now()},{passive:true});
        addEventListener('touchend',e=>{
            const t=e.changedTouches[0];
            if(Math.hypot(t.clientX-sx,t.clientY-sy)>10||Date.now()-st>400)return;
            const d=document.createElement('i');d.className='tap';
            d.style.left=t.clientX+'px';d.style.top=t.clientY+'px';
            document.body.append(d);
            d.addEventListener('animationend',()=>d.remove());
        },{passive:true});
    }
})();