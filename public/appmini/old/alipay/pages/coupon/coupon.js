const app = getApp();
Page({
  data: {
    data_bottom_line_status: false,
    data_list_loding_status: 1,
    data_list_loding_msg: '',
    data_list: [],
    data_base: null,
  },

  onLoad(params) {
    this.init();
  },

  onShow() {
    my.setNavigationBar({title: app.data.common_pages_title.coupon });
  },

  init() {
    // 获取数据
    this.get_data_list();
  },

  // 获取数据
  get_data_list() {
    var self = this;
    my.showLoading({ title: "加载中..." });
    if (self.data.data_list.length <= 0)
    {
      self.setData({
        data_list_loding_status: 1
      });
    }

    my.request({
      url: app.get_request_url("index", "coupon"),
      method: "POST",
      data: {},
      dataType: "json",
      success: res => {
        my.hideLoading();
        my.stopPullDownRefresh();
        if (res.data.code == 0) {
          var data = res.data.data;
          var status = ((data.data || []).length > 0);
          this.setData({
            data_base: data.base || null,
            data_list: data.data || [],
            data_list_loding_msg: '',
            data_list_loding_status: status ? 3 : 0,
            data_bottom_line_status: status,
          });

          // 导航名称
          if ((data.base || null) != null && (data.base.application_name || null) != null)
          {
            my.setNavigationBar({title: data.base.application_name });
          }
        } else {
          self.setData({
            data_bottom_line_status: false,
            data_list_loding_status: 2,
            data_list_loding_msg: res.data.msg,
          });
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        my.hideLoading();
        my.stopPullDownRefresh();
        self.setData({
          data_bottom_line_status: false,
          data_list_loding_status: 2,
          data_list_loding_msg: '服务器请求出错',
        });
        app.showToast("服务器请求出错");
      }
    });
  },

  // 优惠劵领取事件
  coupon_receive_event(e) {
    var user = app.get_user_info(this, "coupon_receive_event");
    // 用户未绑定用户则转到登录页面
    if (app.user_is_need_login(user)) {
      my.redirectTo({
        url: "/pages/login/login?event_callback=coupon_receive_event"
      });
      return false;
    } else {
      var self = this;
      var index = e.currentTarget.dataset.index;
      var value = e.currentTarget.dataset.value;
      var temp_list = this.data.data_list;
      if (temp_list[index]['is_operable'] != 0) {
        my.showLoading({ title: "处理中..." });
        my.request({
          url: app.get_request_url("receive", "coupon"),
          method: "POST",
          data: { "coupon_id": value },
          dataType: "json",
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: res => {
            my.hideLoading();
            if (res.data.code == 0) {
              app.showToast(res.data.msg, "success");
              if (self.data.data_base != null && self.data.data_base.is_repeat_receive != 1)
              {
                temp_list[index]['is_operable'] = 0;
                temp_list[index]['is_operable_name'] = '已领取';
                self.setData({ data_list: temp_list });
              }
            } else {
              app.showToast(res.data.msg);
            }
          },
          fail: () => {
            my.hideLoading();
            app.showToast("服务器请求出错");
          }
        });
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.get_data_list();
  },

});
