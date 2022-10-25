import {
    _decorator,
    assetManager,
    ImageAsset,
    SpriteFrame,
    Texture2D,
    resources,
    log,
    instantiate,
    Node,
    isValid,
    error,
    Label,
    Sprite,
    ProgressBar,
    RichText,
    Slider,
    Toggle,
    EditBox,
    Button,
    UITransform,
    UIOpacity,
    Widget,
    LabelOutline,
    js,
} from "cc";

/**
 * DateTime = Mon Sep 26 2022 13:36:06 GMT+0800 (中国标准时间)
 * Author = 柏白
 *
 */

const isObject = (val) => val !== null && typeof val === "object";

type vforType = { component: any; prefab: string; data: string };

type TargetMapItem = { type: string; property: string; key: string; handle: any };

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

/**
 * 数据绑定
 */
const dataBindingContainer = new WeakMap();

export const enum PropertyType {
    V_BIND = "vbind",
    V_FOR = "vfor",
    V_SHOW = "vshow",
}

export const reactive = function (target: any, obj: any) {
    let thiz = this;
    const handler = {
        get(target: object, propertyKey: PropertyKey, receiver?: any) {
            const result = Reflect.get(target, propertyKey);

            if (isObject(result) && Reflect.isExtensible(result)) {
                const tag = thiz.rawMap.get(result) || propertyKey;
                thiz.rawMap.set(result, tag);
            }

            // log(`get--${String(propertyKey)} -- ${result}`);
            return isObject(result) ? reactive.call(thiz, result) : result;
        },
        set(target: object, propertyKey: PropertyKey, value: any, receiver?: any) {
            // log(`set--${String(propertyKey)}--${value}`);
            const extraInfo = { oldValue: target[propertyKey], newValue: value };

            const result = Reflect.set(target, propertyKey, value);
            emit.call(thiz, target, propertyKey, extraInfo);
            return result;
        },

        deleteProperty(target: object, propertyKey) {
            // log(`${target}--${propertyKey}被刪除`);
            const result = Reflect.deleteProperty(target, propertyKey);
            emit.call(thiz, target, propertyKey, {});
            return result;
        },
    };

    return new Proxy(target, handler);
};

const emit_handle_vbind = function (element: TargetMapItem) {
    let { type, property, key, handle } = element;

    const setValue = (objKey, key, value) => {
        let ok = false;
        if (Reflect.has(objKey, key)) {
            objKey[key] = value;
            ok = true;
        } else if (Reflect.has(objKey, "node")) {
            let node = objKey.node;
            if (Reflect.has(node, key)) {
                node[key] = value;
                ok = true;
            } else {
                if (key.indexOf(".") != -1) {
                    const keyarr = key.split(".");
                    const componentName = "cc." + keyarr[0];
                    const componentKey = keyarr[1];
                    let component = node.getComponent(componentName);
                    if (!component) component = node.addComponent(componentName);
                    if (Reflect.has(component, componentKey)) {
                        component[componentKey] = value;
                        if (component instanceof Widget) {
                            component.updateAlignment();
                        }
                        ok = true;
                    }
                } else {
                    ok = false;
                }
            }
        } else if (key.indexOf(".") != -1) {
            let node = objKey;
            const keyarr = key.split(".");
            const componentName = "cc." + keyarr[0];
            const componentKey = keyarr[1];
            let component = node.getComponent(componentName);
            if (!component) component = node.addComponent(componentName);
            if (Reflect.has(component, componentKey)) {
                component[componentKey] = value;
                if (component instanceof Widget) {
                    component.updateAlignment();
                }
                ok = true;
            }
        } else {
            ok = false;
        }
        return ok;
    };

    if ("string" == typeof handle) {
        let func = funcList[key];
        if (!func) {
            func = commonHandler;
        }
        func(this, handle)
            .then((value) => {
                const result = setValue(this[property], key, value);
                if (result == false) {
                    error(`${property} -> ${key} not find`);
                }
            })
            .catch((e) => {
                log(e);
            });
    } else if ("function" == typeof handle) {
        let value = handle.call(this, this);
        const result = setValue(this[property], key, value);
        if (result == false) {
            error(`${property} -> ${key} not find`);
        }
    } else {
        let value = handle;
        const result = setValue(this[property], key, value);
        if (result == false) {
            error(`${property} -> ${key} not find`);
        }
    }
};

const emit_handle_vfor = function (element: TargetMapItem) {
    let { type, property, key, handle } = element;
    let func = vforHandler;
    func(this, property, handle)
        .then((result) => {
            // log(result);
        })
        .catch((e) => {
            log(e);
        });
};

const emit_handle_vshow = function (element: TargetMapItem) {
    let { type, property, key, handle } = element;
    let func = vshowHandler;
    func(this, property, handle)
        .then((result) => {
            // log(result);
        })
        .catch((e) => {
            log(e);
        });
};

const _emit_func = {
    vbind: emit_handle_vbind,
    vfor: emit_handle_vfor,
    vshow: emit_handle_vshow,
};

const emit = function (target, propertyKey, extraInfo) {
    let newValue = extraInfo?.newValue;
    let oldValue = extraInfo?.oldValue;

    if (oldValue && !hasChanged(newValue, oldValue)) return;

    let cacheKey = this.rawMap.get(target);

    if (isObject(newValue) && Reflect.isExtensible(newValue)) {
        let tag = cacheKey || propertyKey;
        this.rawMap.set(newValue, tag);
    }

    if (cacheKey) {
        propertyKey = cacheKey;
    }

    // log(`emit ${propertyKey}`)
    let map = this.targetMap[propertyKey] || [];
    // map.push({
    //     property: property,
    //     key: key,
    //     handle:handle
    // })
    for (let i = 0; i < map.length; i++) {
        const element = map[i];
        let { type, property, key, handle } = element;
        _emit_func[type].call(this, element);
    }
};

const addToTagetMap = function (type, targetKeyArr, propertyKey, key, handle) {
    if (targetKeyArr.length > 0) {
        for (let i = 0; i < targetKeyArr.length; i++) {
            const element = targetKeyArr[i];
            let map = this.targetMap[element] || [];
            map.push({
                type: type,
                property: propertyKey,
                key: key,
                handle: handle,
            });
            this.targetMap[element] = map;
        }
    }
};

let funcGet = function (target: object, data: string[]) {
    let property = data.shift();
    if (target) {
        if (data.length == 0) {
            return target[property];
        }
        return funcGet(target[property], data);
    }
};

let funcSet = function (target: object, data: string[],value:any) {
    let property = data.shift();
    if (target) {
        if (data.length == 0) {
             target[property] = value;
             return
        }
        funcSet(target[property], data,value);
    }
};


let getValue = function (target:object,arrStr: string[]) {
    let values = [];
    for (let i = 0; i < arrStr.length; i++) {
        let element = new String(arrStr[i]);
        element = element.replace("?", "");
        let pointArr = element.split(".");
        let value = funcGet(target, pointArr);
        values.push(value);
    }
    return values;
};

let setValue = function (target:object,propertyStr: string,value:any) {
    let element = new String(propertyStr);
    element = element.replace("?", "");
    let pointArr = element.split(".");
    funcSet(target,pointArr,value)
};


const getHandleString = function (handle: any) {
    if ("function" == typeof handle) {
        handle = handle.toString();
    } else if ("string" == typeof handle) {
    } else {
        handle = String(handle);
    }
    return handle;
};

const getTargetKeyArray = function (handle: string) {
    let targetKeyArr = [];
    let keys = Object.keys(this.data);
    for (let i = 0; i < keys.length; i++) {
        const targetKey = keys[i];
        if (handle.indexOf(`${targetKey}.`) != -1) {
            targetKeyArr.push(targetKey);
        }
        if (handle.indexOf(`${targetKey}?.`) != -1) {
            targetKeyArr.push(targetKey);
        }

        if (handle == targetKey) {
            targetKeyArr.push(targetKey);
        }

        if (handle.indexOf(`\$\{${targetKey}\}`) != -1) {
            targetKeyArr.push(targetKey);
        }
        if (handle.indexOf(`data.${targetKey}`) != -1) {
            targetKeyArr.push(targetKey);
        }
    }

    return targetKeyArr;
};

const getDefaultKey = function (propertyKey) {
    let obj = this[propertyKey];
    if (obj instanceof Label) {
        return "string";
    } else if (obj instanceof Sprite) {
        return "spriteFrame";
    } else if (obj instanceof ProgressBar) {
        return "progress";
    } else if (obj instanceof RichText) {
        return "string";
    } else if (obj instanceof Slider) {
        return "progress";
    } else if (obj instanceof Toggle) {
        return "isChecked";
    } else if (obj instanceof EditBox) {
        return "string";
    }

    return "string";
};

const getEventTargetKeyString = function (handle: string) {
    let KeyString = null;
    let keys = Object.keys(this.data);
    for (let i = 0; i < keys.length; i++) {
        const targetKey = keys[i];
        if (handle == targetKey) {
            KeyString = handle;
            break;
        }

        if (/\$\{(.+?)\}/.test(handle) == true) {
            KeyString = handle.match(/\$\{(.+?)\}/g)[0];
        }

        if (handle.indexOf(`${targetKey}.`) != -1) {
            KeyString = handle;
            break;
        }

        if (handle.indexOf(`${targetKey}?.`) != -1) {
            KeyString = handle.replace("?", "");
            break;
        }
    }

    return KeyString;
};

/**
 * 双向绑定事件
 * @param propertyKey
 * @param key
 * @param targetKeyString
 */
const onEvent = function (propertyKey, key, targetKeyString) {
    if (targetKeyString) {

        const evalValue = (keyString, value) => {
            if ("string" == typeof value) {
                value = `${value}`;
            }
            setValue(this.data,keyString,value)
        };

        const event = (obj) => {
            if (obj instanceof Slider) {
                return "slide";
            } else if (obj instanceof Toggle) {
                return "toggle";
            } else if (obj instanceof EditBox) {
                return "editing-did-ended";
            }
            return null;
        };

        let obj = this[propertyKey];
        let targetEvent = event(obj);
        if (targetEvent) {
            obj.node.on(
                targetEvent,
                (target) => {
                    evalValue(targetKeyString, target[key]);
                },
                this
            );
        }
    }
};

const track_vbind = function (iterator: any) {
    let { type, propertyKey, handler } = iterator;

    if ("string" == typeof handler) {
        let key = getDefaultKey.call(this, propertyKey);
        let handle = getHandleString(handler);
        let targetKeyArr = getTargetKeyArray.call(this, handle);
        addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);

        const eventTargetKeyArray = getEventTargetKeyString.call(this, handle);
        onEvent.call(this, propertyKey, key, eventTargetKeyArray);
    } else if ("function" == typeof handler) {
        let key = getDefaultKey.call(this, propertyKey);
        let handle = getHandleString(handler);
        let targetKeyArr = getTargetKeyArray.call(this, handle);
        addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
    } else {
        for (const key in handler) {
            // log(handler,propertyKey,key)
            let handle = handler[key];
            handle = getHandleString(handle);
            let targetKeyArr = getTargetKeyArray.call(this, handle);
            addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler[key]);

            if ("string" == typeof handle) {
                const eventTargetKeyArray = getEventTargetKeyString.call(this, handle);
                onEvent.call(this, propertyKey, key, eventTargetKeyArray);
            }
        }
    }
};

const track_vfor = function (iterator: any) {
    let { type, propertyKey, handler } = iterator;

    let key = "data";
    let handle = handler[key];
    handle = getHandleString(handle);
    let targetKeyArr = getTargetKeyArray.call(this, handle);
    addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
};

const track_vshow = function (iterator: any) {
    let { type, propertyKey, handler } = iterator;

    let key = "show";
    let handle = handler;
    handle = getHandleString(handle);
    let targetKeyArr = getTargetKeyArray.call(this, handle);
    addToTagetMap.call(this, type, targetKeyArr, propertyKey, key, handler);
};

const _track_func = {
    vbind: track_vbind,
    vfor: track_vfor,
    vshow: track_vshow,
};

const track = function (iterator: any) {
    let { type, propertyKey, handler } = iterator;
    _track_func[type].call(this, iterator);
};

const inject_define_data = function (key, targetDataBinding) {
    //targetMap
    Object.defineProperty(this, "targetMap", { value: {}, configurable: true, writable: true, enumerable: true });
    Object.defineProperty(this, "rawMap", { value: new WeakMap(), configurable: true, writable: true, enumerable: true });

    //data 数据响应注入
    const iterator = "data";
    let newProerty = `_${iterator}`;
    let value = this[iterator];
    delete this[iterator];
    Object.defineProperty(this, newProerty, { value: value, configurable: true, writable: true, enumerable: true });
    this[iterator] = reactive.call(this, this[newProerty]);
};

const inject_vsearch = function (key, targetDataBinding) {
    let propertys = targetDataBinding["vsearch"] || [];
    if (propertys.length == 0) return;

    let allNodeMap = new Map();
    vsearchHandler(this.node, allNodeMap);
    for (const property of propertys) {
        let className = property.className;
        let tag = property.tag || property.name;

        let instance = allNodeMap.get(tag);
        if (className.prototype.__classname__ != "cc.Node") {
            instance = instance?.getComponent(className) ?? null;
        }

        if (instance == null) {
            error(`没有找到属性 ${key}->${tag}`);
            continue;
        }
        this[property.name] = instance;
    }
    allNodeMap = null;
};

const inject_vclick = function (key, targetDataBinding) {
    let propertys = targetDataBinding["vclick"] || [];

    let getButtonNode = (obj) => {
        let button = null;
        let buttonNode = null;
        buttonNode = obj instanceof Node ? obj : obj.node;
        button = buttonNode.getComponent(Button);
        if (!button) {
            button = buttonNode.addComponent(Button);
        }
        return buttonNode;
    };

    for (const property of propertys) {
        let { tag, name, handler } = property;

        let func = null;
        if ("string" == typeof handler) {
            func = this[handler];
        } else {
            func = handler;
        }

        if (!func) {
            error(`没有找到function ${handler}`);
            continue;
        }

        getButtonNode(this[name]).on(
            "click",
            (button) => {
                func.call(this, button, tag);
            },
            this
        );
    }
};

const inject_track = function (key, targetDataBinding) {
    let property = targetDataBinding["property"] || [];
    for (const iterator of property) {
        track.call(this, iterator);
    }
};

const inject_emit_default = function (key, targetDataBinding) {
    let keys = Object.keys(this.data);
    for (let i = 0; i < keys.length; i++) {
        const targetKey = keys[i];
        if (this.data[targetKey] != null) {
            emit.call(this, this.data, targetKey, null);
        }
    }
};

const _inject_func = [inject_define_data, inject_vsearch, inject_vclick, inject_track, inject_emit_default];

/**
 * ViewModel
 * @param target
 */
export function vm(target: any) {
    const onLoad = target.prototype.onLoad;
    /**
     * 重载onload 注入更新
     */
    target.prototype.onLoad = function () {
        let classKey = js.getClassName(target);
        let targetDataBinding = dataBindingContainer.get(target.prototype) || {};

        for (const func of _inject_func) {
            func.call(this, classKey, targetDataBinding);
        }

        //调用之前的onload
        onLoad?.call(this);
    };
}

/**
 * 绑定点击事件
 * @param {string | function } handler 处理点击事件的方法名称或者方法
 * @param {any} tag  用户自定义数据
 * @returns
 */
export function vclick(handler: any, tag?: any) {
    return (target: any, propertyKey: string) => {
        let targetDataBinding = dataBindingContainer.get(target) || {};
        let propertys = targetDataBinding["vclick"] || [];
        propertys.push({ tag: tag, name: propertyKey, handler: handler });
        targetDataBinding["vclick"] = propertys;
        dataBindingContainer.set(target, targetDataBinding);
    };
}

/**
 * sh
 * @param handler 
 * @returns 
 */
export function vshow(handler: any) {
    return (target: any, propertyKey: string) => {
        let targetDataBinding = dataBindingContainer.get(target) || {};
        let property = targetDataBinding["property"] || [];
        property.push({
            type: PropertyType.V_SHOW,
            propertyKey: propertyKey,
            handler: handler,
        });
        targetDataBinding["property"] = property;
        dataBindingContainer.set(target, targetDataBinding);
    };
}

/**
 * 通过 属性名称 或者标签查询对应的node 或组件
 * @example
 *  @vsearch(Sprite)
 *   icon:Label = null;
 *
 *  @vsearch(Label,"aa")
 *   version:Label = null;
 *
 * @param className 组件名称
 * @param tag 名称
 * @returns
 */
export function vsearch(className: any, tag?: string) {
    return (target: any, propertyKey: string) => {
        let targetDataBinding = dataBindingContainer.get(target) || {};
        let propertys = targetDataBinding["vsearch"] || [];
        propertys.push({ tag: tag, name: propertyKey, className: className });
        targetDataBinding["vsearch"] = propertys;
        dataBindingContainer.set(target, targetDataBinding);
    };
}

/**
 *循环添加预制件到容器中，一般是ScrollView Layout ToggleGrop

 *@example
 *  @vfor({ prefab: "itemPrefab", component: Item, data: "goodsList" })
 *  @property(Node)
 *  content: Node = null;
 *
 * @param {string} handler.prefab 预制体名称 
 * @param {string} handler.component 预制体脚本名称 
 * @param {string} handler.data 预制体数据数组
 * @returns
 */
export function vfor(handler: vforType) {
    return (target: any, propertyKey: string) => {
        let targetDataBinding = dataBindingContainer.get(target) || {};
        let property = targetDataBinding["property"] || [];
        property.push({
            type: PropertyType.V_FOR,
            propertyKey: propertyKey,
            handler: handler,
        });
        targetDataBinding["property"] = property;
        dataBindingContainer.set(target, targetDataBinding);
    };
}

/**
 * 绑定数据
 * @example
 * 绑定string
 *  @vbind({string:"tt.aa"})
 *  @property(Label)
 *  aaa: Label = null;
 *
 *  @vbind({string:"${tt.aa}米/${bb.cc}亩"})
 *  @property(Label)
 *  aaa: Label = null;
 *
 * 绑定精灵图片
 *  @vbind({spriteFrame:"tt.aa"})
 *  @property(Sprite)
 *  aaa: Sprite = null;
 *
 *  @vbind({spriteFrame:"${tt.aa}"})
 *  @property(Sprite)
 *  aaa: Sprite = null;
 *
 *  绑定处理器
 *
 *
 * @param handler
 * @returns
 */
export function vbind(handler: any) {
    return (target: any, propertyKey: string) => {
        let targetDataBinding = dataBindingContainer.get(target) || {};
        let property = targetDataBinding["property"] || [];
        property.push({
            type: PropertyType.V_BIND,
            propertyKey: propertyKey,
            handler: handler,
        });
        targetDataBinding["property"] = property;
        dataBindingContainer.set(target, targetDataBinding);
    };
}




/**
 * 字符串处理
 * @param target
 * @param data
 * @returns
 */
function stringHandler(target: any, data: string): Promise<string> {

    let split = function (handlerStr) {
        let propertyArrString = [];
        let stack = [];
        for (let i = 0; i < handlerStr.length; i++) {
            const e = handlerStr[i];
            if ("{" == e) {
                stack.push(i + 1);
            } else if ("}" == e) {
                let startPos = stack.pop();
                let length = i - startPos;
                let propertyStr = handlerStr.substr(startPos, length);
                propertyArrString.push(propertyStr);
            }
        }
        return propertyArrString;
    };


    let replase = function(oldString,keyArr,valueArr){
        let newString = new String(oldString)
        for (let i = 0; i < keyArr.length; i++) {
            const key = keyArr[i];
            const value = valueArr[i];
            newString = newString.replace(`\$\{${key}\}`,value)
        }
        return newString
    }

    return new Promise((res, rej) => {
        try {
            let keyArr = split(data);
            if(keyArr.length == 0){
                res(getValue(target.data,[data])[0])
            }else if(keyArr.length == 1 && `\$\{${keyArr[0]}\}` == data){
                res(getValue(target.data,keyArr)[0])
            }else{
                let valueArr = getValue(target.data,keyArr);
                let newString = replase(data,keyArr,valueArr)
                res(newString.valueOf())
            }
        
        } catch (e) {
            rej("失败");
        }
    });
}

/**
 * 图片处理
 * @param target
 * @param data
 * @returns
 */
function spriteFrameHandler(target: any, data: string) {
    return new Promise(async (res, rej) => {
        let url = await stringHandler(target, data);
        if (url.startsWith("http")) {
            assetManager.loadRemote(url, { ext: ".png" }, (error: Error, data: ImageAsset) => {
                if (!!error) {
                    rej(`${url}加载失败！`);
                    return;
                }

                const spriteFrame = new SpriteFrame();
                spriteFrame.packable = true;
                const texture = new Texture2D();
                texture.image = data;
                spriteFrame.texture = texture;
                res(spriteFrame);
            });
        } else {
            resources.load(url + "/spriteFrame", SpriteFrame, (e: Error, spriteFrame: SpriteFrame) => {
                if (!!e) {
                    rej(`${url}加载失败！`);
                    return;
                }
                res(spriteFrame);
            });
        }
    });
}

/**
 *
 * @param target
 * @param data
 * @returns
 */
function commonHandler(target: any, data: string): Promise<any> {
    return stringHandler(target,data);
}

/**
 *
 * @param target
 * @param property
 * @param handle
 * @returns
 */
function vshowHandler(target: any, property: string, handle: any) {
    return new Promise(async (res, rej) => {
        try {
            let propertyIns = target[property];
            let node = propertyIns instanceof Node ? propertyIns : propertyIns.node;
            if ("string" == typeof handle) {
                commonHandler(target, handle)
                    .then((value) => {
                        node.active = value;
                    })
                    .catch((e) => {
                        log(e);
                    });
            } else if ("function" == typeof handle) {
                node.active = handle.call(target, target);
            } else {
                node.active = handle;
            }
            res(1);
        } catch (e) {
            rej(e);
        }
    });
}

/**
 *
 * @param target
 * @param property
 * @param handle
 * @returns
 */
function vforHandler(target: any, property: string, handle: vforType) {
    return new Promise(async (res, rej) => {
        try {
            let { component, prefab, data } = handle;

            let dataIns: any[] = await commonHandler(target, data);
            let propertyIns: Node = target[property];

            propertyIns.removeAllChildren();
            for (let i = 0, length = dataIns.length; i < length; i++) {
                const element = dataIns[i];
                let inc = instantiate(target[prefab]);
                let compScript = inc.getComponent(component);
                let func_onload = compScript.onLoad;
                compScript.onLoad = function () {
                    func_onload?.call(compScript);
                    compScript.setData(element);
                };

                propertyIns.addChild(inc);
            }
            res(1);
        } catch (e) {
            rej(e);
        }
    });
}

function vsearchHandler(parent: any, map: Map<string, Node>) {
    map.set(parent.name, parent);
    let children = parent.children;
    for (const key in children) {
        if (!isValid(children[key])) continue;
        vsearchHandler(children[key], map);
    }
}

const funcList = {
    common: commonHandler,
    string: stringHandler,
    spriteFrame: spriteFrameHandler,
};
