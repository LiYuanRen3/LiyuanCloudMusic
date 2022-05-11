import request from '../../../utils/request'
import PubSub from 'pubsub-js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recentPlayweekData:[],//播放记录详情
    index: 0, // 点击音乐的下标
    userinfo: [],//用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //读取用户信息
    let userinfo = wx.getStorageSync('userinfo');
    if(userinfo){
      // 更新user的状态
      this.setData({
          userinfo: JSON.parse(userinfo)
      });
    }
    // 显示正在加载
    wx.showLoading({
      title: '正在加载'
    })

    // 获取用户播放记录
    this.getUserRecentPlayList(this.data.userinfo.userId);

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let {recentPlayweekData, index} = this.data;
      if(type === 'pre'){ // 上一首
        (index == 0) && (index = recentPlayweekData.length);
        index -= 1;
      }else { // 下一首
        (index == recentPlayweekData.length - 1) && (index = -1);
        index += 1;
      }
      // 更新下标
      this.setData({
        index
      })
      let musicId = recentPlayweekData[index].song.id;
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
      
    });
  },

  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(userId){
    let recentPlayListData = await request('/user/record', {uid: userId, type: 1});
    let recentPlayweekData = recentPlayListData.weekData
    this.setData({
      recentPlayweekData
    })
    // 关闭消息提示框
    wx.hideLoading();
  },

  // 跳转至songDetail页面
  toSongDetail(event){
    let {song, index} = event.currentTarget.dataset;
    this.setData({
      index
    })
    // 路由跳转传参： query参数
    wx.navigateTo({ 
      // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id

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