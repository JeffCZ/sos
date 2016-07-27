    {
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
      loadingAcceptedTime:1000//改时间内onload的话不出现loading页内容，也就是SLoading_con
    }