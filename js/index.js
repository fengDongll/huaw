define(["parabola", "jquery", "jquery-cookie"], function(parabola, $){
    function index(){
        $(function(){

            sc_num();
            sc_msg();

            $.ajax({
                url: "../data/data.json",
                // dataType: "json",  
                success: function(arr){
                    
                    // alert(arr); 下载到的数据，是已经解析完成的数据
                    for(var i = 0; i < arr.length; i++){
                        var node =  $(`<li class = 'goods_item'>
                            <div class = 'goods_pic'>
                                <img src="${arr[i].img}" alt=""/>
                            </div>
                            <div class = 'goods_title'>
                                <p>【京东超市】奥利奥软点小草莓</p>
                            </div>
                            <div class = 'sc'>
                                <div id = '${arr[i].id}' class = "sc_btn">加入购物车</div>
                            </div>
                        </li>`);

                        node.appendTo(".goods_box ul");
                        //【注】JQ中所有的操作都是批量操作。
                        //【注】ajax下载数据，加载页面是异步操作，
                    }
                },
                error: function(msg){
                    console.log(msg);
                }
            })

            //事件委托
            $(".goods_box ul").on("click", ".sc_btn", function(){
                ballMove(this);
                //加入购物车按钮所在商品的，商品id
                /* 
                    cookie里面存储购物车的数据
                    1、cookie大小有限制 只存储商品的id和商品数量
                    2、cookie只能存储字符  将数据结构转成json格式字符串在进行存储

                    [{id:1,num:2},{id:3,num1}];

                    考虑cookie存储的流程
                 */
                var id = this.id;

                var first = $.cookie("goods") == null ? true : false;
                if(first){
                    //第一次添加
                    // $.cookie("goods", `[{"id":${id},"num":1}]`);
                    var arr = [{id: id, num:1}];
                    $.cookie("goods", JSON.stringify(arr), {
                        expires: 7
                    })
                }else{
                    //如果不是第一次添加，判断之前是否添加过
                    var cookieStr = $.cookie("goods");
                    var cookieArr = JSON.parse(cookieStr);
                    
                    var same = false; //假设没有添加过该商品
                    //通过循环，去判断是否有符合条件的元素
                    for(var i = 0; i < cookieArr.length; i++){
                        if(id == cookieArr[i].id){
                            same = true;
                            cookieArr[i].num++;
                            break;
                        }
                    }

                    if(!same){
                        cookieArr.push({id:id, num: 1});
                    }

                    //将数据存回cookie
                    $.cookie("goods", JSON.stringify(cookieArr), {
                        expires: 7
                    })
                    
                }
                sc_num();
                sc_msg();
                // alert($.cookie("goods"));
            })
            /* 
                加载右侧购物车的数据
                购物车的数据是存储在cookie中  商品id和商品的数量

                1、data.json 数据源这个部分 拥有商品所有的数据
                2、判断哪些商品在购物车cookie里，然后将加入购物车商品的数据单独筛选出来。
             */
            function sc_msg(){
                //清空上一次加载的数据
                // $(".sc_right ul").html("");
                $(".sc_right ul").empty(); //清空当前节点下所有的子节点

                $.ajax({
                    url: "../data/data.json",
                    success: function(arr){
                        var cookieStr = $.cookie("goods");
                        var newArr = [];
                        if(cookieStr){
                            var cookieArr = JSON.parse(cookieStr);
                            for(var i = 0; i < arr.length; i++){
                                for(var j = 0; j < cookieArr.length; j++){
                                    //在cookie中这个商品有记录
                                    if(arr[i].id == cookieArr[j].id){
                                        arr[i].num = cookieArr[j].num;
                                        newArr.push(arr[i]);
                                    }
                                }
                            }
                            for(var i = 0; i < newArr.length; i++){
                                var node = $(`<li id = '${newArr[i].id}'>
                                    <div class = 'sc_goodsPic'>
                                        <img src="${newArr[i].img}" alt=""/>
                                    </div>
                                    <div class = 'sc_goodsTitle'>
                                        <p>这是商品曲奇饼干</p>
                                    </div>
                                    <div class = 'sc_goodsBtn'>购买</div>
                                    <div class = 'sc_deleteBtn'>删除</div>
                                    <div class = 'sc_goodsNum'>商品数量:${newArr[i].num}</div>
                                    <button>+</button>
                                    <button>-</button>
                                </li>`);
                                node.appendTo($(".sc_right ul"));
                            }
                           
                        }
                    }
                })
            }
            //给右侧购物车添加移入和移出
            $(".sc_right").mouseenter(function(){
                $(this).stop(true).animate({
                    right: 0
                }, 500)
            })

            $(".sc_right").mouseleave(function(){
                $(this).stop(true).animate({
                    right: -270
                }, 500)
            })
            

            //商品数量总数如何计算
            function sc_num(){
                var cookieStr = $.cookie("goods");
                if(cookieStr){
                    //计算求和
                    var cookieArr = JSON.parse(cookieStr);
                    var sum = 0;
                    for(var i = 0; i < cookieArr.length; i++){
                        sum += cookieArr[i].num;
                    }
                    $(".sc_right .sc_num").html(sum);
                }else{
                    $(".sc_right .sc_num").html(0);
                }
            }

            //抛物运动的函数
            function ballMove(oBtn){
                //将小球显示，并且小球的位置移动到小球的位置
                $("#ball").css({
                    display: 'block',
                    left: $(oBtn).offset().left,
                    top: $(oBtn).offset().top
                })

                //计算抛物线运动要进行的相对位置
                var X = $(".sc_right .sc_pic").offset().left - $("#ball").offset().left;
                var Y = $(".sc_right .sc_pic").offset().top - $("#ball").offset().top;

                //1、创建一个抛物线对象
                var bool = new Parabola({
                    el: "#ball",
                    offset: [X, Y],
                    duration: 600,
                    curvature: 0.0005,
                    callback: function(){
                        $("#ball").hide();
                    }
                });
                bool.start();
            }

            $("#removeSc").click(function(){
                $.cookie("goods", null);
                sc_num();
                sc_msg();
            })


            //给右侧购物车商品的删除按钮添加点击事件，事件委托添加
            $(".sc_right ul").on("click", ".sc_deleteBtn", function(){
                /* 
                    1、将页面存在的节点删除
                    2、cookie存储的数据删除 必须通过当前所在商品的id删除
                 */
                var id = $(this).closest("li").remove().attr("id");
                var cookieStr = $.cookie("goods");
                var cookieArr = JSON.parse(cookieStr);
                for(var i = 0; i < cookieArr.length; i++){
                    if(cookieArr[i].id == id){
                        cookieArr.splice(i, 1);
                        break;
                    }
                }
                //判断数组是否为空
                if(!cookieArr.length){
                    $.cookie("goods", null);
                }else{
                    $.cookie("goods", JSON.stringify(cookieArr), {
                        expires: 7
                    })
                }
                sc_num();
            })

            //通过事件委托去给加和减添加点击事件
            $(".sc_right ul").on("click", "button", function(){
                //1、获取商品id
                var id = $(this).closest("li").attr("id");
                //2、找到我们修改的商品
                var cookieStr = $.cookie("goods");
                var cookieArr = JSON.parse(cookieStr);
                for(var i = 0; i < cookieArr.length; i++){
                    if(id == cookieArr[i].id){
                        //3、判断操作是+还是-
                        if(this.innerHTML == "+"){
                            cookieArr[i].num++;
                        }else{
                            //判断
                            if(cookieArr[i].num == 1){
                                alert("数量已经为1，不能再减");
                            }else{
                                cookieArr[i].num--;
                            }
                        }
                        //设置页面上新的商品数量
                        $(this).prevAll(".sc_goodsNum").html("商品数量:" + cookieArr[i].num);
                        $.cookie("goods", JSON.stringify(cookieArr), {
                            expires: 7
                        })


                        break;
                    }
                }
                sc_num();
            })
        })
    }
    return {
        index: index
    }
})