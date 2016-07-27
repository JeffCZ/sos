var SOS=(function(){

function SOS(paras){
  this.opt={
    mode:"SFade",//页面切换模式，有SSlide、SFade，可以用SCustom然后自己在_sos.scss里定制各种效果
    direction:"vertical",
    wrap:"#wrap",//最外层dom
    pages:".page",//页面dom
    inClass:"in",//表示当前page的类
    outClass:"out",//在屏幕上的排布顺序是：page.out->page.in->page，可f12查看
    onloadClass:"onload",//用来加载资源的class，尽量把需要延迟加载的background-image写在这个类的子类
    content:".content",//每一页里按设计稿比例展现的层
    contentPos:"center",//每一页里按设计稿比例展现的层的位置：top,center bottom
    contentMode:"contain",//每一页里按设计稿比例展现的层的缩放选择：cover和contain，类似background-size
    playClass:"play",//在切换完成那一刻为当前页加上的类名，和in是不同的两个时间点，主要是为不同时间点的css动画准备的
    designedWidth:720,//设计稿宽度
    designedHeight:1169,//设计稿高度，根据designedWidth和designedHeight对.content层设置尺寸和定位
    minSwipeDistance:50,//最小滑动有效距离，单位为px，超过才触发页面切换
    onSwitch:null,//开始切换页面，传入到达页的index
    onSwitchEnd:null,//切换页面结束，传入到达页的index
    shareConfig:{
      img_url: "",
      link: window.location.href,
      desc: document.title,
      title: document.title
    },//分享配置，可以传入一个对象或者一个数组，数组[0]:分享给好友的配置，数组[1]:表示分享到朋友圈的配置
    musicSrc:"",//音乐文件src
    loadingAcceptedTime:800//改时间内onload的话不出现loading页内容，也就是SLoading_con
  }
  if(paras){
    for(a in paras){
      this.opt[a]=paras[a];
    }
  }
  this.init();
}
SOS.prototype={
  ww:window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
  wh:window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  x0:0,
  y0:0,
  x1:0,
  y1:0,
  distance:0,
  now:0,
  length:0,
  wrap:null,
  pages:null,
  startTarget:null,
  endTarget:null,
  transitionEndFlag:0,
  lock:false,
  addClass:function (o,cls) {
      if (o.classList) {
          o.classList.add(cls)
      }else {
          o.className+=' '+cls;
      }
  },
  removeClass:function (o,cls) {
      if (o.classList) {
          o.classList.remove(cls)
      }else {
          o.className=o.className.replace(new RegExp('\\s*\\b'+cls+'\\b','g'),'')
      }
  },
  hasClass:function(o,cls){
    return new RegExp('(\\s|^)' + cls + '(\\s|$)').test(o.className);
  },
  bindEvent:function(){
    var self = this;
    document.addEventListener('touchstart',function (e) {
        self.touchstart(e);
    },false);
    document.addEventListener('touchmove',function (e) {
        self.touchmove(e);
    },false);
    document.addEventListener('touchend',function (e) {
        self.touchend(e);
    },false);
    var transitionEndesignedHeightandler = function(e){
      self.transitionEndFlag++;
      self.lock=false;
      if(self.transitionEndFlag==1){
        for(var i=0;i<self.length;i++){
          if(i==self.now){
            self.addClass(self.pages[i],self.opt.playClass);
          }else{
            self.removeClass(self.pages[i],self.opt.playClass);
          }
        }
        if(self.opt.onSwitchEnd)self.opt.onSwitchEnd(self.now);
      }
    }
    self.wrap.addEventListener("webkitTransitionEnd",transitionEndesignedHeightandler);
  },
  touchstart:function(e){
    if(e.touches.length !== 1)return;
    this.x0=e.changedTouches[0].pageX;
    this.y0=e.changedTouches[0].pageY;
    this.startTarget=e.target.id;
  },
  touchmove:function(e){
    e.preventDefault();
  },
  touchend:function(e){
    this.x1=e.changedTouches[0].pageX;
    this.y1=e.changedTouches[0].pageY;
    
    if(this.lock==true) return;

    this.distance=(this.opt.direction=="horizontal")?this.x1-this.x0:this.y1-this.y0;
    
    if(Math.abs(this.distance)<this.opt.minSwipeDistance) return;
    
    if(this.distance<0){
      if(this.now<this.length-1){
        this.now++;
      }else{
        return;
      }
    } 
    if(this.distance>0){
      if(this.now>0){
        this.now--;
      }else{
        return;
      }
    }
    this.lock=true;
    this.go();
  },
  go:function(){
    var self=this;
    self.transitionEndFlag=0;

    if(this.opt.onSwitch)this.opt.onSwitch(this.now);
    
    // in and out
    for(var i=0;i<self.length;i++){
      if(i<self.now){
        self.removeClass(self.pages[i],self.opt.inClass);
        self.addClass(self.pages[i],self.opt.outClass);
      }else if(i==self.now){
        self.removeClass(self.pages[i],self.opt.outClass);
        self.addClass(self.pages[i],self.opt.inClass);
      }else{
        self.removeClass(self.pages[i],self.opt.inClass);
      }
    }

    //onload
    self.addClass(self.pages[self.now],self.opt.onloadClass);
    if(self.pages[self.now+1])self.addClass(self.pages[self.now+1],self.opt.onloadClass);
    
  },
  scalePage:function(){
    
    var self = this,
        wRatio = self.ww/self.wh,
        dRatio = self.opt.designedWidth/self.opt.designedHeight;
    
    var contentPosCss = (function(){
      switch(self.opt.contentPos){
        case "top":return "top:0;right:0;bottom:auto;left:0;margin:auto;";
        case "bottom":return "top:auto;right:0;bottom:0;left:0;margin:auto;";
        default:return "top:0;right:0;bottom:0;left:0;margin:auto;";
      }
    })();

    var contentSizeCss = (function(){
      if(wRatio>dRatio){
        if(self.opt.contentMode=="cover"){
          return "width:"+self.ww+"px;height:"+Math.ceil(self.ww/dRatio)+"px;";
        }else{
          return "width:"+Math.ceil(self.wh*dRatio)+"px;height:"+self.wh+"px;";
        }
      }else{
        if(self.opt.contentMode=="cover"){
          return "width:"+Math.ceil(self.wh*dRatio)+"px;height:"+self.wh+"px;";
        }else{
          return "width:"+self.ww+"px;height:"+Math.ceil(self.ww/dRatio)+"px;";
        }
      }
    })();
    
    var targets=document.querySelectorAll(self.opt.pages+" "+self.opt.content);
    for(var i=0;i<targets.length;i++){
      targets[i].style.cssText = contentPosCss+contentSizeCss
    }
    
  },
  initMusic:function(){
    var self = this,
      button = document.createElement("div");
      audio = document.createElement("audio");
    if(self.opt.musicSrc){
      audio.id="SMusic";
      audio.src=self.opt.musicSrc;
      audio.loop=true;
      audio.preload=true;
      audio.style.display="none";
      button.id="SMusicBtn";
      self.addClass(button,"SMusicBtn_On");
      document.getElementsByTagName('body')[0].appendChild(button);
      document.getElementsByTagName('body')[0].appendChild(audio);
      audio.play();
      button.addEventListener("click",function(){
        var b=this;
        if(self.hasClass(b,"SMusicBtn_On")){
          self.removeClass(b,"SMusicBtn_On");
          self.addClass(b,"SMusicBtn_Off");
          audio.pause();
        }else{
          self.addClass(b,"SMusicBtn_On");
          self.removeClass(b,"SMusicBtn_Off");
          audio.play();
        }
      });
    }else{
      return;
    }
  },
  initShare:function(){
    var self = this;
    if (typeof WeixinJSBridge == "undefined" && typeof onBridgeReady == 'function') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    }
    function onBridgeReady() {
      //hack for music in ios
      var audio = document.querySelector("#SMusic");
      audio.play();
      //shareConfig[0]:好友；shareConfig[1]:朋友圈；
      if(self.opt.shareConfig.length>1){
        WeixinJSBridge.on("menu:share:appmessage",function() {
          WeixinJSBridge.invoke("sendAppMessage", self.opt.shareConfig[0]);
        });
        WeixinJSBridge.on("menu:share:timeline",function() {
          WeixinJSBridge.invoke("shareTimeline", self.opt.shareConfig[1]);
        });
      }else{
        WeixinJSBridge.on("menu:share:appmessage",function() {
          WeixinJSBridge.invoke("sendAppMessage", self.opt.shareConfig);
        });
        WeixinJSBridge.on("menu:share:timeline",function() {
          WeixinJSBridge.invoke("shareTimeline", self.opt.shareConfig);
        });
      }
    }
  },
  init:function(){
    var self=this;
    self.wrap=document.querySelector(self.opt.wrap);
    self.pages=document.querySelectorAll(self.opt.pages);
    self.scalePage();
    self.length=self.pages.length;
    self.bindEvent();
    self.initMusic();
    self.initShare();

    var onloadStatus = 0;
    setTimeout(function(){
      if(onloadStatus==1){
        document.querySelector("#SLoading_con").style.cssText="display:none;";
      }else{
        document.querySelector("#SLoading_con").style.cssText="display:block;";
      }
    },self.opt.loadingAcceptedTime);

    window.onload=function(){
      onloadStatus=1;
      self.go();
      setTimeout(function(){
        document.querySelector("#SLoading").style.cssText="display:none;";
      },100);
    }
    
  }
}
return SOS;
})();