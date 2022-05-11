import request from '../../utils/request'
import PubSub from 'pubsub-js';
let isSend = false; // 函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', // placeholder的内容
    hotList: [], // 热搜榜数据
    searchContent: '', // 用户输入的表单项数据
    searchList: [], // 关键字模糊匹配的数据
    historyList: [], // 搜索历史记录
    index: 0, // 点击音乐的下标
    SingleContentdisList:[], //搜索内容单曲数据
    SingerContentdisList:[], //搜索内容歌手数据
    AlbumContentdisList:[] //搜索内容专辑数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取初始化数据
    this.getInitData();
    
    // 获取历史记录
    this.getSearchHistory();

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      if(SingleContentdisList==null){
        var {searchList, index} = this.data;
        var musicSong = searchList.length;
      }else{
        var {SingleContentdisList, index} = this.data;
        var musicSong = SingleContentdisList.length;
      }
      if(type === 'pre'){ // 上一首
        (index == 0) && (index = musicSong);
        index -= 1;
      }else { // 下一首
        (index == musicSong - 1) && (index = -1);
        index += 1;
      }
      
      // 更新下标
      this.setData({
        index
      })
      let musicId = searchList[index].id;
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
      
    });
  },
  // 获取初始化的数据
  async getInitData(){
    let placeholderData = await request('/search/default');
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },
  
  // 获取本地历史记录的功能函数
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory');
    if(historyList){
      this.setData({
        historyList
      })
    }
  },

  // 表单项内容发生改变的回调
  handleInputChange(event){
    // 更新searchContent的状态数据
    this.setData({
      searchContent: event.detail.value.trim()
    })
    if(isSend){
      return
    }
    isSend = true;
    this.getSearchList();
     // 函数节流
    setTimeout( () => {
      isSend = false;
    }, 36)

  },



  // 获取搜索数据的功能函数
  async getSearchList(){
    if(!this.data.searchContent){
      this.setData({
        searchList: [],
        SingleContentdisList: []
      })
      return;
    }else if(this.data.searchContent==''){
      this.setData({
        searchList: [],
        SingleContentdisList: []
      })
      return;
    }
    let {searchContent} = this.data;
    // 发请求获取关键字模糊匹配数据
    let searchListData = await request('/search', {keywords: searchContent , type: 1 , limit: 10});
    this.setData({
      searchList: searchListData.result.songs
    })
  },

  // 清空搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: [],
      SingleContentdisList: []
    })
  },
  
  // 删除搜索历史记录
  deleteSearchHistory(){
    wx.showModal({
      content: '确认删除吗?',
      success: (res) => {
        if(res.confirm){
          // 清空data中historyList
          this.setData({
            historyList: []
          })
          // 移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
    })
   
  },

  //搜索内容预览
  HotSearch(event){
    let searchContent = "";
    let searchContentA = event.currentTarget.dataset.song.searchWord;//排行name
    let searchContentB = event.currentTarget.dataset.song;
    let searchContentC = event.currentTarget.dataset.song.name;//
    if(searchContentA!=undefined){
      searchContent=searchContentA;
    }else if(searchContentB!=''){
      searchContent=searchContentB;
    }else{
      searchContent=searchContentC;
    }
    this.setData({
      searchContent
    })
     if(isSend){
       return
     }
     isSend = true;
     this.getSearchList();
     // 函数节流
    setTimeout( () => {
      isSend = false;
    }, 36)
    
  },

  //搜索内容展示
  async getsearchSongs(event){
    if(!this.data.searchContent){
      this.setData({
        SingleContentdisList: []
      })
      return;
    }

    let {searchContent} = this.data;
    // 发请求获取单曲匹配数据
    let ContentdisListDQ = await request('/search', {keywords: searchContent , type: 1 , limit: 36});
    // 发请求获取歌手匹配数据
    let singerName = ContentdisListDQ.result.songs[0].artists[0].name;
    let ContentdisListGS = await request('/search', {keywords: singerName , type: 100 , limit: 1});
    // 发请求获取专辑匹配数据
    let ContentdisListZJ = await request('/search', {keywords: searchContent , type: 10 , limit: 36});
    // 发请求获取歌单匹配数据
    // let ContentdisListGD = await request('/search', {keywords: searchContent , type: 1000 , limit: 36});
    // 发请求获取播单匹配数据
    // let ContentdisListBD = await request('/search', {keywords: searchContent , type: 1009 , limit: 36});

    //歌手列表
    let SingerContentdisList = ContentdisListGS.result.artists[0];
    //歌曲列表
    let SingleContentdisList = ContentdisListDQ.result.songs;
    //专辑列表
    let AlbumContentdisList = {
      name:ContentdisListZJ.result.albums[0].name,
      img:ContentdisListZJ.result.albums[0].artist.img1v1Url,
      singerName:ContentdisListZJ.result.albums[0].artist.name
    };
    //歌单列表
    // let songltContentdisList =ContentdisListGD;
    //播单列表
    // let PlayltContentdisList =ContentdisListBD;

    //赋值给初始数据
    this.setData({
      SingleContentdisList,
      SingerContentdisList,
      AlbumContentdisList
    })

    //定义搜索关键字
    let {historyList} = this.data;
    // 将搜索的关键字添加到搜索历史记录中
    if(historyList.indexOf(searchContent) !== -1){
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList
    })
    
    wx.setStorageSync('searchHistory', historyList)
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
