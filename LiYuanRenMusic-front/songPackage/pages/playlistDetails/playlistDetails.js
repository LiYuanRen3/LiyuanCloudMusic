import request from '../../../utils/request'
import PubSub from 'pubsub-js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    playlistId:0,//歌曲Id
    isRast:0,//电台Boolean
    PlaylistDetails:[],//歌单详情
    podcastDetails:[],//播客详情
    podcastDetailt:[],//播客节目详情
    index: 0, // 点击音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let playlistId = options.playlistId;
    let isRast = options.isRast
    this.setData({
      playlistId,
      isRast
    })
    // 显示正在加载
    wx.showLoading({
      title: '正在加载'
    })
    if(isRast!=3){
      // 获取歌单详情
      this.getPlaylistDetails(playlistId)
    }else{
      // 获取播客详情
      this.getpodcastDetails(playlistId)
    }
    if(isRast!=3){
      // 订阅来自songDetail页面发布的消息
      PubSub.subscribe('switchType', (msg, type) => {
        let {PlaylistDetails, index} = this.data;
        if(type === 'pre'){ // 上一首
          (index == 0) && (index = PlaylistDetails.tracks.length);
          index -= 1;
        }else { // 下一首
          (index == PlaylistDetails.tracks.length - 1) && (index = -1);
          index += 1;
        }
        // 更新下标
        this.setData({
          index
        })
        let musicId = PlaylistDetails.tracks[index].id;
        // 将musicId回传给songDetail页面
        PubSub.publish('musicId', musicId,)
      });

    }else{
      // 订阅来自songDetaildj页面发布的消息
      PubSub.subscribe('switchType', (msg, type) => {
        let {podcastDetailt, index} = this.data;
        if(type === 'pre'){ // 上一首
          (index == 0) && (index = podcastDetailt.length);
          index -= 1;
        }else { // 下一首
          (index == podcastDetailt.length - 1) && (index = -1);
          index += 1;
        }
        // 更新下标
        this.setData({
          index
        })
        let musicIds = podcastDetailt[index].mainSong.id;
        let programId = podcastDetailt[index].id
        let musicId = {info:programId,id: musicIds}
        // 将musicId回传给songDetail页面
        PubSub.publish('musicId', musicId)
      });

    }
    
  },

  // 获取歌单详情功能函数
  async getPlaylistDetails(playlistId){
    let PlaylistDetailsong = await request('/playlist/detail', {id: playlistId});
    let PlaylistDetails = PlaylistDetailsong.playlist;
    this.setData({
      PlaylistDetails
    })
    // 关闭消息提示框
    wx.hideLoading();
  },

  // 获取播客详情功能函数
  async getpodcastDetails(playlistId){
    //获取播客详情
    let podcastDetailsong = await request('/dj/detail', {rid: playlistId});
    let podcastDetails = podcastDetailsong.djRadio;
    //获取播客节目详情
    let podcastDetailtong = await request('/dj/program', {rid: podcastDetails.id});
    let podcastDetailt = podcastDetailtong.programs;
    this.setData({
      podcastDetails,
      podcastDetailt
    })
    // 关闭消息提示框
    wx.hideLoading();
  },

  // 单曲跳转至songDetail页面
  toSongDetail(event){
    let {song, index , pid} = event.currentTarget.dataset;
    let isRast = 0;
    this.setData({
      index
    })
    // 路由跳转传参： query参数
    wx.navigateTo({ 
      // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id +'&isRast='+isRast+'&pid='+pid
    })
  },
  
  // 电台跳转至songDetail页面
  toSongDetaildj(event){
    console.log(event.currentTarget.dataset);
    let {song, index} = event.currentTarget.dataset;
    let isRast = 3;
    this.setData({
      index
    })
    // 路由跳转传参： query参数
    wx.navigateTo({ 
      // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
      url: '/songPackage/pages/songDetail/songDetail?musicId='+ song.mainSong.id 
      +'&programId=' +song.id
      + '&isRast=' +isRast

    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if(this.data.isRast!=3){
      // 将歌单列表发布给songDetail页面
      PubSub.publish('getSongSheet',this.data.isRast,this.data.playlistId)
    }else{
      // 将播单列表发布给songDetail页面
      PubSub.publish('getSongSheet',this.data.isRast,this.data.playlistId)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})