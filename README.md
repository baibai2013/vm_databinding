# vm_databinding

#### 介绍🍼

vm_databinding是基于typescript的装饰器以mvvm模式开发，实现cocos creator 数据绑定框架。用户子需要关心数据和业务逻辑，操作cocos UI方面的事情交给vm来处理。vm的响应式设计在改变数据的同时，UI也随之改变。

#### 灵感的由来💡

最近开发的项目主要偏数据展示的功能，在UI上会需要大量调用设置sprite、label属性的工作，工作量不少。最近也在学习Typescript的装饰器（Decorator），发现之前装饰器的使用场景非常丰富，给已有的方法和类扩展一些新的行为，比如记录日志，注入调试，大大解放的双手，提高生产力。cocos中@ccclass和@property就是这个运用。知道装饰器这一点并不能完成我的预期， 之前开发插件中，发现Vue这个前端流行框架实现了mvvm的响应式编程。Vue的原理分析，结果是es6 proxy对象，将对象进行转化拦截，get触发track，set时执行trigger更新UI effect。突然头顶上的电灯被点亮了，没错就是它vm_databinding。

#### 解决什么问题📋

##### 1. 如何达到启动并绑定数据❓

```javascript
@vm
```

这个是一个类的装饰器，像@ccclass一样放在Component顶部。Component生命周期中的onLoad方法是入口，通过重写这个方法给类赋予新的属性，收集属性，完成绑定事件等工作。

```javascript
@vm
@ccclass("test")
export class test extends Component {
    ....
}
```

##### 2. vue中的数据model是data，vm中的model呢❓

```javascript
 data = {
        a:"苹果",
        show:1,
        ...   
    }
```

没错也是data，把你需要的数据放在data对象中就好了，更改data对应的数据将响应UI更新。之前有考虑过要不要放在data里，后来发现还是放在里面吧，一是比较方便管理查找，二是proxy代理方便做数据绑定。

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        a:"苹果",
        show:1,
        color:Color.RED,
        ...   
    }

    setData(data:any){
        this.data.show = data.show;
        this.data.a = '香蕉';
    }
    ...
}

```

##### 3. 数据有了，如何绑定view我们的Sprite或者Label呢❓

```javascript
  @vbind(handler:string | object)
  @property(Label)
  aaa: Label = null;

```

@vbind绑定UI上的控件，放在属性上面。handler可以字符串或对象或方法。

* 字符串形式
  里面可以使绑定组件(Component)的默认属性，比如Label的string，Sprite的spriteFrame等等。和格式

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        a:"苹果",
        count:5,
        show:1,
        color:Color.RED,
        icon:'icon/1',//对应assets/resouses/icon/1
        ...   
    }

    @vbind('a') //绑定data.a  等价 this.goodsName.string='苹果'
    @property(Label)
    goodsName: Label = null;

    @vbind('${count}个')// 绑定data.count 等价 this.count.string='5个'
    @property(Label)
    count: Label = null;

    @vbind("icon")//绑定data.icon 等价 this.sprite1.spriteFrame = load('icon/1')
    @property(Sprite)
    sprite1: Sprite = null;
    ...
}
```

* 方法形式
  如果你有自己的特殊需求，比如，有逻辑控制的显示内容。可以这样用

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        state:1,
        ...   
    }

    @vbind(function(){
       return(this.data.state == 0)?"闲置":"生产中"
    }) //绑定data.state 等价 this.stateLabel.string = (this.data.state == 0)?"闲置":"生产中"
    @property(Label)
    stateLabel: Label = null;

    @vbind((t:test)=>(t.data.state == 0)?"闲置":"生产中")
    @property(Label)
    stateLabel: Label = null;

    ...
}
```

* 对象形式
  如果组件多个属性需要绑定数据时，可以这样用

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        name:"苹果",
        count:5,
        color:Color.RED,
        fontSize:18,
        icon:'icon/1',
        opacity:100,
        angle:80,
        scale:new Vec3(2,1,2),
        ...   
    }

    @vbind({ 
        spriteFrame: "icon",
        'UIOpacity.opacity': 'opacity',
        angle: 'angle',
        scale: 'scale',
     })
    @property(Sprite)
    sprite2: Sprite = null;

     @vbind({
        'LabelOutline.color':'color',
        string: "我有物品${name}:${count}个",
        color: "color",
        fontSize: (t:test)=>t.data.fontSize+1
    })
    @property(Label)
    lable6: Label = null;
    ...
}
```

看上去是不是非常简单，配置一下绑定关心就可以了！

##### 4. 常用的点击事件有吗❓有的。

```javascript
/**
 * 绑定点击事件
 * @param {string | function } handler 处理点击事件的方法名称或者方法
 * @param {any} tag  用户自定义数据
 * @returns 
 */
 vclick(handler: any, tag?: any)

```

vclick绑定点击事件，可以传入当前类的方法或者匿名方法。点击触发

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        name:"苹果",
        isshow:false,
        ...   
    }

    @vclick("clickBtn", 1)
    @property(Button)
    addBtn: Button = null;

    @vclick("clickBtn", 2) //绑定this.clickBtn 传入自定义值 2
    @property(Node)
    removeBtn: Node = null;


    //传入方法
    @vclick(function(b,data){  //函数绑定当前this 可以用this调用
        log(`click btn ${b.name}-- ${data}`)
        this.data.isshow = !this.data.isshow;
    }, 2)
    @property(Node)
    btn: Node = null;


    /**
     * @param {Button} b 按钮
     * @param {any} data 用户自定义数据 
     */
    clickBtn(b, data) {
       if (data == 1) {
            //add
        } else if (data == 2) {
            //remove
        }
    }

    ...
}
```

##### 5. 有些组件需要双向绑定，比如Slider的progress改变啦，绑定数据会更新吗❓

当然会，有交互的有Slider、Toggle、EditBox都会双向绑定的。注意，应为是双向绑定这些组件只支持string类型的形式，不支持function和复杂表达式。

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        progress:0.1,
        checked:true,
        content:'',
        ...   
    }

    @vbind("progress") //默认绑定 progress属性
    @property(Slider)
    slider: Slider = null;

    @vbind("checked")//默认绑定isChecked属性 
    @property(Toggle)
    toggle: Toggle = null;

    @vbind("content")//默认绑定string属性 
    @property(EditBox)
    editBox: EditBox = null;

    @vbind({ progress: "progress" })
    @property(Slider)
    slider2: Slider = null;

    @vbind({ isChecked: "checked" })
    @property(Toggle)
    toggle2: Toggle = null;

    @vbind({ string: "content" })
    @property(EditBox)
    editBox2: EditBox = null;
    ...
}
```

##### 6. @property这个修饰器还需要UI上去拖拽对应node，有简单的方法直接找到吗❓

```javascript

/**
 * 通过 属性名称 或者标签查询对应的node 或组件
 * 
 *  @vsearch(Sprite)
 *   icon:Label = null;
 *
 *  @vsearch(Label,"aa")
 *   version:Label = null;
 *
 * @param className 组件类型
 * @param tag 名称
 * @returns
 */
vsearch(className: any, tag?: string)

```

有通过@vsearch可以方便找到对应属性名称的节点或直接找到组件，最要UI名称对应的上 名称唯一，名称唯一，名称唯一就能找到（重要的话说三千遍）。这样就不用拖拽了，当然如果是数组形式的还是用 @property吧 数组形式目前不支持vbind

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        progress:0.1,
        checked:true,
        content:'',
        ...   
    }

    @vbind("progress")
    @vsearch(Slider) //替换property 找名称为slider的组件，名称唯一
    slider: Slider = null;

    @vbind("checked")
    @vsearch(Toggle)
    toggle: Toggle = null;

    @vbind("content")
    @vsearch(EditBox)
    editBox: EditBox = null;

    @vsearch([EditBox]) //不支持vbind
    editBox: EditBox[] = null;
    ...
}
```

##### 7. ScrollView，Layout 填数据好麻烦呀有没有简单的方法❓

```javascript

/**
 *循环添加预制件到容器中，一般是ScrollView Layout ToggleGrop

 *@example
 *  @vfor({ prefab: "itemPrefab", component: Item, data: "goodsList" })
 *  @property(Node)
 *  content: Node = null;
 * 
 * @param {object} handler 配置信息
 * @param {string} handler.prefab 预制体名称 
 * @param {string} handler.component 预制体脚本名称 
 * @param {string} handler.data 预制体数据数组
 * @returns
 */
vfor(handler: vforType)
```

有的，@vfor可以帮你简化向UI容器里添加元素，数据的更改也会更新UI容器的内容。

物品数据

```javascript

export interface Goods{
    name:string,
    count:number,
    icon:string
    price?:number
}
```

容器元素脚本

```javascript


@vm
@ccclass("Item")
export class Item extends Component {

    data = {
        prefabData:null,
  
    };

    @vbind("${prefabData.name}")
    @vsearch(Label)
    goodsName:Label = null;

    @vbind("${prefabData.price}元")
    @vsearch(Label)
    goodsPrice:Label = null;

    @vbind("${prefabData.count}个")
    @vsearch(Label)
    goodsCount:Label = null;

    @vbind("${prefabData.icon}")
    @vsearch(Sprite)
    goodsIcon:Sprite = null;

    onLoad(){

    }

    //必须有的方法
    setData(goods:Goods){
        this.data.prefabData = goods
    }
    ...
}

```

```javascript

@vm
@ccclass("test")
export class test extends Component {
    data = {
        goodsList:null, //物品数组
        ...   
    }

    @property(Prefab)
    itemPrefab: Prefab = null;

    /**
     * prefab绑定预制件 itemPrefab
     * component 绑定脚本 Item
     * data 绑定this.data.goodsList 
     */
    @vfor({ prefab: "itemPrefab", component: Item, data: "goodsList" })
    @property(Node)
    content: Node = null;

    setData(){
        this.data.goodsList = model.getGoodsList();//网络服务器或者本地获取物品列表
    }
}
```

这么好用的mvvm数据绑定框架为什么不试试呢？😏

#### 版本📆

1.0

#### 待解优化 📋

* 👉全局的vm，目前只是绑定局部的数据data之后绑定全局的model可能会更好



 :rocket: :rocket: :rocket:  