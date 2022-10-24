import { _decorator, Component, Node, Label, Color, Sprite, Prefab, instantiate, ToggleContainer, ProgressBar, RichText, Slider, Toggle, input, EditBox, Button, log, UITransform, Size, UIOpacity, Vec3, Widget } from "cc";
import { Goods } from "./Interface";
import { Item } from "./Item";
import { vbind, vclick, vfor, vm, vsearch, vshow } from "./lib/VM";
import { model } from "./Model";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = test
 * DateTime = Mon Sep 26 2022 14:00:44 GMT+0800 (中国标准时间)
 * Author = 柏白
 * FileBasename = test.ts
 * FileBasenameNoExtension = test
 * URL = db://assets/test.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@vm
@ccclass("test")
export class test extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    data = {

        widget:{
            left:200,
            top:50,
            right:50,
            bottom:50
        },

        mydata2: {
            color: Color.RED,
            color2: Color.BLUE,
            contentSize: new Size(50,50),
            angle: 80,
            scale: new Vec3(2,1,2),
            opacity: 50,
            fontSize: 12,
            pre: "购买",
        },
        myGoods: null,
        myGoods2: null,
        goodsList: null,
        ggname: null,
        ggicon: null,
        isshow: true,
        progress: 0.2,
        richText: "<color=#00ff00>RRRRR</color><color=#0fffff>Text</color>",
        checked: false,
        inputString: {
            a: "aaaaa",
        },
    };

    @vbind("物品${myGoods.name}")
    @property(Label)
    lable1: Label = null;

    @vbind({ string: "${ggname} 物品" })
    @property(Label)
    lable2: Label = null;

    @vbind({ string: "物品${myGoods.name}" })
    @property(Label)
    lable3: Label = null;

    @vbind({ string: "我有物品${myGoods.name}:${myGoods.count}个" })
    @property(Label)
    lable4: Label = null;

    @vbind((t) => (t.data.myGoods.count > 2 ? `${t.data.myGoods.name}物品` : `卖完了`))
    @property(Label)
    lable5: Label = null;

    @vbind({
        'LabelOutline.color':'mydata2.color2',
        string: "我有物品${myGoods.name}:${myGoods.count}个",
        color: "mydata2.color",
        fontSize: "${mydata2.fontSize}",
    })
    @property(Label)
    lable6: Label = null;

    @vbind({
        string: function(){
            return `${this.data.mydata2.pre}物品${this.data.myGoods?.name}--${this.data.myGoods?.count}`;
        },
    })
    @property(Label)
    lable7: Label = null;

    @vbind("myGoods.icon")
    @property(Sprite)
    sprite1: Sprite = null;

    @vbind({ 
        spriteFrame: "myGoods2?.icon",
        'UITransform.contentSize': 'mydata2.contentSize',
        'UIOpacity.opacity': 'mydata2.opacity',
        angle: 'mydata2.angle',
        scale: 'mydata2.scale',
     })
    @property(Sprite)
    sprite2: Sprite = null;

    @property(Prefab)
    itemPrefab: Prefab = null;

    @vfor({ prefab: "itemPrefab", component: Item, data: "goodsList" })
    @property(Node)
    content: Node = null;

    @vbind({ string: "myGoods2?.name", color: "mydata2.color" })
    @vsearch(Label, "aa")
    version: Label = null;

    //组件设置show
    @vshow("isshow")
    @vbind({
        spriteFrame:"ggicon",
        'Widget.left':'widget.left'
    })
    @vsearch(Sprite)
    icon: Sprite = null;

    //节点设置show
    @vbind({ active: "isshow" })
    @vsearch(Node)
    icon2: Node = null;

    @vbind({ progress: "progress" })
    @vsearch(ProgressBar)
    ProgressBar: ProgressBar = null;

    @vbind({ string: "richText" })
    @vsearch(RichText)
    RichText: RichText = null;

    @vbind({ progress: "progress" })
    @vsearch(Slider)
    Slider: Slider = null;

    @vbind({ isChecked: "checked" })
    @vsearch(Toggle)
    Toggle: Toggle = null;

    @vbind({ string: "inputString.a" })
    @vsearch(EditBox)
    EditBox: EditBox = null;

    @vclick("clickBtn", 1)
    @vsearch(Button)
    addBtn: Button = null;

    @vclick("clickBtn", 2)
    @vsearch(Node)
    removeBtn: Node = null;

    @vclick(function(b,data){
        log(`click btn ${b.name}-- ${data}`)
        this.data.isshow = !this.data.isshow;
        this.data.mydata2.color = (this.data.isshow)?Color.GREEN:Color.RED;
        this.data.mydata2.fontSize = (this.data.isshow)?24:12;
        this.data.myGoods2.name = (this.data.isshow)?"黄瓜":"苹果";
        this.data.goodsList[0].name = (this.data.isshow)?"黄瓜":"苹果";
    }, 2)
    @vsearch(Node)
    btn: Node = null;


    onLoad() {

        this.scheduleOnce(() => {
            ToggleContainer;

            this.data.ggname = "果果果果";
            this.data.ggicon = "icon/3";

            this.setGoodsInfo({
                name: "苹果",
                icon: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fd00.paixin.com%2Fthumbs%2F1742172%2F38157571%2Fstaff_1024.jpg&refer=http%3A%2F%2Fd00.paixin.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1666765658&t=25844b42000830d6c016ba571420138e",
                count: 1,
            });

            this.setGoods2Info({
                name: "梨",
                icon: "icon/2",
                count: 5,
            });

            this.setData();

        }, 1);
    }

    setGoodsInfo(goods: Goods) {
        this.data.myGoods = goods;
        this.data.myGoods.name = "西瓜";
    }
    setGoods2Info(goods: Goods) {
        this.data.myGoods2 = goods;
    }

    setData() {
        this.data.goodsList = model.goodsLit;
    }

    /**
     * 
     * @param {Button} b 按钮
     * @param {any} data 用户自定义数据 
     */
    clickBtn(b, data) {
        if (data == 1) {
            this.clickAdd(b, data);
        } else if (data == 2) {
            this.clickRemove(b, data);
        }
    }

    clickRemove(b, data) {
        log(`click clickRemove ${data}`);

        let array: any[] = this.data.goodsList;
        array.splice(0, 1);
    }

    clickAdd(b, data) {
        log(`click add ${data}`);

        let array: any[] = this.data.goodsList;
        array.push({
            name: "梨",
            icon: "icon/2",
            price: 15,
            count: 1,
        });
    }

    start() {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
