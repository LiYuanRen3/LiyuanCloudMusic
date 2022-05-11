import request from '../../utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],//轮播图数据
    recommendList: [],//推荐歌单数据
    radioStationListData:[],//推荐播客数据
    topList: [] ,//排行榜数据
    index: 0, // 点击音乐的下标
    indexLength:3 , //排行榜音乐下标长度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function () {
    //轮播图请求
    let bannerListData = await request('/banner', {type: 1});
    this.setData({
      bannerList: bannerListData.banners
    });
    //推荐歌曲请求
    let recommendListData = await request('/personalized', {limit: 10});
    //热门电台请求
    let radioStationListData = await request('/dj/hot',{limit: 10});
    this.setData({
      recommendList: recommendListData.result,
      radioStationListData: radioStationListData.djRadios
    });
    //排行榜请求
    let index = 0;
    let resultArr = [];
    while(index<5){
      let topListData = await request('/top/list', {idx: index++});
      let toplistItem = {name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3),id: topListData.playlist.id}
      resultArr.push(toplistItem);
      this.setData({
        topList: resultArr
      });
    }
    
  },
  // 跳转至recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong'
    })
  },

  //跳转歌单详情界面(歌单)
  toPlaylistDetails(event){
    let playlistId = event.currentTarget.dataset.song.id;
    let isRast = 0;
    wx.navigateTo({ 
      url: '../../songPackage/pages/playlistDetails/playlistDetails?playlistId=' + playlistId+'&isRast='+isRast
    })
  },

  //跳转歌单详情界面(电台)
  topodcastDetails(event){
    let playlistId = event.currentTarget.dataset.song.id;
    let isRast = 3;
    wx.navigateTo({ 
      url: '../../songPackage/pages/playlistDetails/playlistDetails?playlistId='+ playlistId+'&isRast='+isRast
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