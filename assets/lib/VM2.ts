import { _decorator, assetManager, ImageAsset, SpriteFrame, Texture2D, resources, log, instantiate, Node, isValid, error, Label, Sprite } from "cc";

/**
 * DateTime = Mon Sep 26 2022 13:36:06 GMT+0800 (中国标准时间)
 * Author = 柏白
 *
 * 声明式编程
 * fp 函数式编程
 */

const isObject = (val) => val !== null && typeof val === "object";

/***********************************************   handlers ****************************************/

const handlers = {
    get(target:object,key:string|symbol,receiver:object){
        const res = Reflect.get(target,key,receiver);
        track(target,key)
        return isObject(res)? reactive(res) : res;
    }
}


/***********************************************   handlers ****************************************/


/***********************************************   reactive ****************************************/

const proxyMap  = new WeakMap(); //缓存代理过的对象
const rawMap  = new WeakMap(); //缓存被代理的对象


function reactive(object:any){

}

/***********************************************   reactive ****************************************/

/***********************************************   effect ****************************************/
const targetMap = new WeakMap();
export let activeEffect = null;



function track(target: object, key: any) {
   
}
/***********************************************   effect ****************************************/


// type vforType = { component: any; prefab: string; data: string };

// type TargetMapItem = { type: string; property: string; key: string; handle: any };


// /**
//  * 数据绑定
//  */
//  const dataBindingContainer: {} = {};

// export const enum PropertyType {
//     V_BIND = "vbind",
//     V_FOR = "vfor",
//     V_SHOW = "vshow",
// }

// export const reactive = function (target: any, obj: any) {
//     let thiz = this;
//     const handler = {
//         get(target: object, propertyKey: PropertyKey, receiver?: any) {
//             const result = Reflect.get(target, propertyKey);
//             log(`get--${String(propertyKey)} -- ${result}`);
//             return isObject(result) ? reactive.call(thiz, result) : result;
//         },
//         set(target: object, propertyKey: PropertyKey, value: any, receiver?: any) {
//             log(`set--${String(propertyKey)}`);
//             const extraInfo = { oldValue: target[propertyKey], newValue: value };

//             const result = Reflect.set(target, propertyKey, value);
//             emit.call(thiz, target, propertyKey, extraInfo);
//             return result;
//         },

//         deleteProperty(target: object, propertyKey) {
//             log(`${target}--${propertyKey}被刪除`);
//             const result = Reflect.deleteProperty(target, propertyKey);
//             emit.call(thiz, target, propertyKey, {});
//             return result;
//         },
//     };

//     return new Proxy(target, handler);
// };

// const emit_handle_vbind = function (element: TargetMapItem) {
//     let { type, property, key, handle } = element;

//     if ("string" == typeof handle) {
//         let func = funcList[key];
//         if (!func) {
//             func = commonHandler;
//         }
//         func(this, handle)
//             .then((result) => {
//                 this[property][key] = result;
//             })
//             .catch((e) => {
//                 log(e);
//             });
//     } else if ("function" == typeof handle) {
//         this[property][key] = handle(this);
//     } else {
//         this[property][key] = handle;
//     }
// };

// const emit_handle_vfor = function (element: TargetMapItem) {
//     let { type, property, key, handle } = element;
//     let func = vforHandler;
//     func(this, property, handle)
//         .then((result) => {
//             log(result);
//         })
//         .catch((e) => {
//             log(e);
//         });
// };

// const emit_handle_vshow = function (element: TargetMapItem) {
//     let { type, property, key, handle } = element;
//     let func = vshowHandler;
//     func(this, property, handle)
//         .then((result) => {
//             log(result);
//         })
//         .catch((e) => {
//             log(e);
//         });
// };

// const _emit_func = {
//     vbind: emit_handle_vbind,
//     vfor: emit_handle_vfor,
//     vshow: emit_handle_vshow,
// };

// const emit = function (target, propertyKey, extraInfo) {
//     let map = this.targetMap[propertyKey] || [];
//     // map.push({
//     //     property: property,
//     //     key: key,
//     //     handle:handle
//     // })
//     for (let i = 0; i < map.length; i++) {
//         const element = map[i];
//         let { type, property, key, handle } = element;
//         _emit_func[type].call(this, element);
//     }
// };

// const addToTagetMap = function (type, targetKeyArr, propertyKey, key, handle) {
//     if (targetKeyArr.length > 0) {
//         for (let i = 0; i < targetKeyArr.length; i++) {
//             const element = targetKeyArr[i];
//             let map = this.targetMap[element] || [];
//             map.push({
//                 type: type,
//                 property: propertyKey,
//                 key: key,
//                 handle: handle,
//             });
//             this.targetMap[element] = map;
//         }
//     }
// };


// const getHandleString = function (handle: any) {
//     if ("function" == typeof handle) {
//         handle = handle.toString();
//     } else if ("string" == typeof handle) {
//     } else {
//         handle = String(handle);
//     }
//     return handle;
// };

// const getTargetKeyArray = function (handle: string) {
//     let targetKeyArr = [];
//     let keys = Object.keys(this.data);
//     for (let i = 0; i < keys.length; i++) {
//         const targetKey = keys[i];
//         if (handle.indexOf(`${targetKey}.`) != -1) {
//             targetKeyArr.push(targetKey);
//         }
//         if (handle.indexOf(`${targetKey}?.`) != -1) {
//             targetKeyArr.push(targetKey);
//         }

//         if (handle == targetKey) {
//             targetKeyArr.push(targetKey);
//         }

//         if (handle.indexOf(`\$\{${targetKey}\}`) != -1) {
//             targetKeyArr.push(targetKey);
//         }
//         if (handle.indexOf(`data.${targetKey}`) != -1) {
//             targetKeyArr.push(targetKey);
//         }
//     }

//     return targetKeyArr;
// };

// const getDefaultKey = function (propertyKey) {
//     let obj = this[propertyKey];
//     if (obj instanceof Label) {
//         return "string";
//     } else if (obj instanceof Sprite) {
//         return "spriteFrame";
//     }

//     return "string";
// };

// const track_vbind = function (iterator: any) {
//     let { type, propertyKey, handler } = iterator;

//     if ("string" == typeof handler) {
//         let key = getDefaultKey.call(this, propertyKey);
//         let handle = getHandleString(handler);
//         let targetKeyArr = getTargetKeyArray.call(this, handle);
//         addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
//     } else if ("function" == typeof handler) {
//         let key = getDefaultKey.call(this, propertyKey);
//         let handle = getHandleString(handler);
//         let targetKeyArr = getTargetKeyArray.call(this, handle);
//         addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
//     } else {
//         for (const key in handler) {
//             // log(handler,propertyKey,key)
//             let handle = handler[key];
//             handle = getHandleString(handle);
//             let targetKeyArr = getTargetKeyArray.call(this, handle);
//             addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler[key]);
//         }
//     }
// };

// const track_vfor = function (iterator: any) {
//     let { type, propertyKey, handler } = iterator;

//     let key = "data";
//     let handle = handler[key];
//     handle = getHandleString(handle);
//     let targetKeyArr = getTargetKeyArray.call(this, handle);
//     addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
// };

// const track_vshow = function (iterator: any) {
//     let { type, propertyKey, handler } = iterator;

//     let key = "show";
//     let handle = handler;
//     handle = getHandleString(handle);
//     let targetKeyArr = getTargetKeyArray.call(this, handle);
//     addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
// };

// const _track_func = {
//     vbind: track_vbind,
//     vfor: track_vfor,
//     vshow: track_vshow,
// };

// const track = function (iterator: any) {
//     let { type, propertyKey, handler } = iterator;
//     _track_func[type].call(this, iterator);
// };

// const inject_define_data = function (key, targetDataBinding) {
//     //targetMap
//     Object.defineProperty(this, "targetMap", { value: {}, configurable: true, writable: true, enumerable: true });

//     //data 数据响应注入
//     const iterator = "data";
//     let newProerty = `_${iterator}`;
//     let value = this[iterator];
//     delete this[iterator];
//     Object.defineProperty(this, newProerty, { value: value, configurable: true, writable: true, enumerable: true });
//     this[iterator] = reactive.call(this, this[newProerty]);
// };

// const inject_vsearch = function (key, targetDataBinding) {
//     let propertys = targetDataBinding["vsearch"] || [];
//     for (const property of propertys) {
//         let className = property.className;
//         let tag = property.tag || property.name;

//         let instance = vsearchHandler(this, tag);
//         if (className.name != "Node") {
//             instance = instance?.getComponent(className) ?? null;
//         }

//         if (instance == null) {
//             error(`没有找到属性 ${key}->${property.name}`);
//             continue;
//         }
//         this[property.name] = instance;
//     }
// };

// const inject_track = function (key, targetDataBinding) {
//     let protperty = targetDataBinding["protperty"] || [];
//     for (const iterator of protperty) {
//         track.call(this, iterator);
//     }
// };

// const inject_emit_default = function (key, targetDataBinding) {
//     let keys = Object.keys(this.data);
//     for (let i = 0; i < keys.length; i++) {
//         const targetKey = keys[i];
//         if (this.data[targetKey] != null) {
//             emit.call(this, this.data, targetKey, null);
//         }
//     }
// };

// const _inject_func = [inject_define_data, inject_vsearch, inject_track, inject_emit_default];

// /**
//  * ViewModel
//  * @param target
//  */
// export function vm(target: any) {
//     const onLoad = target.prototype.onLoad;
//     /**
//      * 重载onload 注入更新
//      */
//     target.prototype.onLoad = function () {
//         let classKey = `${this.constructor.name}`;
//         let targetDataBinding = dataBindingContainer[classKey] || {};

//         for (const func of _inject_func) {
//             func.call(this, classKey, targetDataBinding);
//         }

//         //调用之前的onload
//         onLoad?.call(this);
//     };
// }

// export function vshow(handler: any) {
//     return (target: any, propertyKey: string) => {
//         let key = `${target.constructor.name}`;
//         let targetDataBinding = dataBindingContainer[key] || {};
//         let protperty = targetDataBinding["protperty"] || [];
//         protperty.push({
//             type: PropertyType.V_SHOW,
//             propertyKey: propertyKey,
//             handler: handler,
//         });
//         targetDataBinding["protperty"] = protperty;
//         dataBindingContainer[key] = targetDataBinding;
//     };
// }

// /**
//  * 通过 属性名称 或者标签查询对应的node 或组件
//  * @example
//  *  @vsearch(Sprite)
//  *   icon:Label = null;
//  *
//  *  @vsearch(Label,"aa")
//  *   version:Label = null;
//  *
//  * @param className 组件名称
//  * @param tag 名称
//  * @returns
//  */
// export function vsearch(className: any, tag?: string) {
//     return (target: any, propertyKey: string) => {
//         let key = `${target.constructor.name}`;
//         let targetDataBinding = dataBindingContainer[key] || {};
//         let propertys = targetDataBinding["vsearch"] || [];
//         propertys.push({ tag: tag, name: propertyKey, className: className });
//         targetDataBinding["vsearch"] = propertys;
//         dataBindingContainer[key] = targetDataBinding;
//     };
// }

// /**
//  *循环添加预制件到容器中，一般是ScrollView Layout ToggleGrop
//  *@example
//  *  @vfor({ prefab: "itemPrefab", component: Item, data: "goodsList" })
//  *  @property(Node)
//  *  content: Node = null;
//  *
//  * @param handler
//  * @returns
//  */
// export function vfor(handler: vforType) {
//     return (target: any, propertyKey: string) => {
//         let key = `${target.constructor.name}`;
//         let targetDataBinding = dataBindingContainer[key] || {};
//         let protperty = targetDataBinding["protperty"] || [];
//         protperty.push({
//             type: PropertyType.V_FOR,
//             propertyKey: propertyKey,
//             handler: handler,
//         });
//         targetDataBinding["protperty"] = protperty;
//         dataBindingContainer[key] = targetDataBinding;
//     };
// }

// /**
//  * 绑定数据
//  * @example
//  * 绑定string
//  *  @vbind({string:"tt.aa"})
//  *  @property(Label)
//  *  aaa: Label = null;
//  *
//  *  @vbind({string:"${tt.aa}米/${bb.cc}亩"})
//  *  @property(Label)
//  *  aaa: Label = null;
//  *
//  * 绑定精灵图片
//  *  @vbind({spriteFrame:"tt.aa"})
//  *  @property(Sprite)
//  *  aaa: Sprite = null;
//  *
//  *  @vbind({spriteFrame:"${tt.aa}"})
//  *  @property(Sprite)
//  *  aaa: Sprite = null;
//  *
//  *  绑定处理器
//  *
//  *
//  * @param handler
//  * @returns
//  */
// export function vbind(handler: any) {
//     return (target: any, propertyKey: string) => {
//         let key = `${target.constructor.name}`;
//         let targetDataBinding = dataBindingContainer[key] || {};
//         let protperty = targetDataBinding["protperty"] || [];
//         protperty.push({
//             type: PropertyType.V_BIND,
//             propertyKey: propertyKey,
//             handler: handler,
//         });
//         targetDataBinding["protperty"] = protperty;
//         dataBindingContainer[key] = targetDataBinding;
//     };
// }

// /**
//  * 字符串处理
//  * @param target
//  * @param data
//  * @returns
//  */
// function stringHandler(target: any, data: string): Promise<string> {
//     return new Promise((res, rej) => {
//         try {
//             if (data.indexOf("{") != -1) {
//                 data = data.replace(/{/g, "{target.data.");
//             } else {
//                 data = "${target.data." + data + "}";
//             }

//             let funcstr = `(target)=>\`${data}\``;
//             let func = eval(funcstr);
//             let result = func.call(target, target);
//             res(result);
//         } catch (e) {
//             rej("失败");
//         }
//     });
// }

// /**
//  * 图片处理
//  * @param target
//  * @param data
//  * @returns
//  */
// function spriteFrameHandler(target: any, data: string) {
//     return new Promise(async (res, rej) => {
//         let url = await stringHandler(target, data);
//         if (url.startsWith("http")) {
//             assetManager.loadRemote(url, { ext: ".png" }, (error: Error, data: ImageAsset) => {
//                 if (!!error) {
//                     rej(`${url}加载失败！`);
//                     return;
//                 }

//                 const spriteFrame = new SpriteFrame();
//                 spriteFrame.packable = true;
//                 const texture = new Texture2D();
//                 texture.image = data;
//                 spriteFrame.texture = texture;
//                 res(spriteFrame);
//             });
//         } else {
//             resources.load(url + "/spriteFrame", SpriteFrame, (e: Error, spriteFrame: SpriteFrame) => {
//                 if (!!e) {
//                     rej(`${url}加载失败！`);
//                     return;
//                 }
//                 res(spriteFrame);
//             });
//         }
//     });
// }

// /**
//  *
//  * @param target
//  * @param data
//  * @returns
//  */
// function commonHandler(target: any, data: string): Promise<any> {
//     return new Promise((res, rej) => {
//         if (data.indexOf("{") != -1) {
//             data = data.replace(/\${/g, "target.data.");
//             data = data.replace(/}/g, "");
//         } else {
//             data = "target.data." + data;
//         }

//         let funcstr = `(target)=>${data}`;
//         let func = eval(funcstr);
//         let result = func.call(target, target);
//         res(result);
//     });
// }

// /**
//  *
//  * @param target
//  * @param property
//  * @param handle
//  * @returns
//  */
// function vshowHandler(target: any, property: string, handle: any) {
//     return new Promise(async (res, rej) => {
//         try {
//             let propertyIns = target[property];

//             if (propertyIns instanceof Node) {
//                 propertyIns.active = await commonHandler(target, handle);
//             } else {
//                 propertyIns.node.active = await commonHandler(target, handle);
//             }
//             res(1);
//         } catch (e) {
//             rej(e);
//         }
//     });
// }

// /**
//  *
//  * @param target
//  * @param property
//  * @param handle
//  * @returns
//  */
// function vforHandler(target: any, property: string, handle: vforType) {
//     return new Promise(async (res, rej) => {
//         try {
//             let { component, prefab, data } = handle;

//             let dataIns: any[] = await commonHandler(target, data);
//             let propertyIns: Node = target[property];

//             propertyIns.removeAllChildren();
//             for (let i = 0, length = dataIns.length; i < length; i++) {
//                 const element = dataIns[i];
//                 let inc = instantiate(target[prefab]);
//                 propertyIns.addChild(inc);
//                 inc.getComponent(component).prefabData = element;
//             }
//             res(1);
//         } catch (e) {
//             rej(e);
//         }
//     });
// }

// function vsearchHandler(target: any, parent: any, uiName: string = null) {
//     if (typeof parent == "string") {
//         uiName = parent;
//         parent = target.node;
//     }

//     if (parent.name === uiName) {
//         return parent;
//     }

//     let children = parent.children;
//     for (const key in children) {
//         if (!isValid(children[key])) continue;
//         let resultNode = vsearchHandler(target, children[key], uiName);
//         if (resultNode) {
//             return resultNode;
//         }
//     }
// }

// const funcList = {
//     common: commonHandler,
//     string: stringHandler,
//     spriteFrame: spriteFrameHandler,
// };
