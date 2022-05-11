let staetY = 0;//手指起始坐标
let moveX = 0;//手指移动坐标
let moveDistance = 0;//手指移动距离
import request from '../../utils/request'
import PubSub from 'pubsub-js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coveTransition: '',
    userinfo: {},//用户信息
    recentPlayList: [], // 用户播放记录展览
    recentPlayweekData: [],//用户播放记录歌单
    UserSongList :[],//用户歌单
    UserRadioStationList:[],//用户电台
    index: 0, // 点击音乐的下标
    playlistId:0//歌单id
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //读取用户信息
    let userinfo = wx.getStorageSync('userinfo');
    if(userinfo){
      // 更新userInfo的状态
      this.setData({
        userinfo: JSON.parse(userinfo)
      });
      
      // 获取用户播放记录
      this.getUserRecentPlayList(this.data.userinfo.userId);
      // 获取用户歌单
      this.getUserSongList(this.data.userinfo.userId);

    }

  },
    
  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(userId){
    let recentPlayListData = await request('/user/record', {uid: userId, type: 1});
    let recentPlayList = recentPlayListData.weekData
    this.setData({
      recentPlayList
    })

  },

  // 获取用户歌单的功能函数
  async getUserSongList(userId){
    let UserSongList = await request('/user/playlist', {uid: userId});
    this.setData({
      UserSongList: UserSongList.playlist
    })
  },

  //跳转歌单详情界面
  toPlaylistDetails(event){
    let playlistId = event.currentTarget.dataset.song.id;

    wx.navigateTo({ 
      url: '../../songPackage/pages/playlistDetails/playlistDetails?playlistId=' + playlistId
    })
  },

  toplayRecordTab(event){
    wx.navigateTo({ 
      url: '../../songPackage/pages/playRecordTab/playRecordTab'
    })
  },

  bindtouchstart(e){
    //获取手指起始坐标
    staetY = e.touches[0].clientY;
    this.setData({
      coveTransition:''
    })
  },
  bindtouchmove(e){
    //获取手指移动坐标与手指移动距离
    moveX = e.touches[0].clientY;
    moveDistance = moveX-staetY;
    if(moveDistance <= 0){
      return;
    }
    if(moveDistance >= 80){
      moveDistance = 80;
    }
    //更新coverTransfrom的状态值
    this.setData({
      coverTransform:`translateY(${moveDistance}rpx)`
    })
  },
  bindtouchend(){
    //更新coverTransfrom的状态值
    this.setData({
      coverTransform:`translateY(0rpx)`,
      coveTransition:'transform 1s'
    })
  },
  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
    });
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