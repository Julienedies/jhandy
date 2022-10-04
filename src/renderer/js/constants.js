/**
 *
 * Created by j on 2019-09-13.
 */

// 交易系统增删改查
export const ADD_SYSTEM = 'ADD_SYSTEM';
export const ON_SET_SYSTEM_DONE = 'ON_SET_SYSTEM_DONE';
export const EDIT_SYSTEM = 'EDIT_SYSTEM';

// 标签数据增删改查
export const ADD_TAG = 'tag.add';
export const EDIT_TAG = 'tag.edit';
export const DEL_TAG = 'DEL_TAG'

export const ON_SET_TAG_DONE = 'tag.edit.done';
export const GET_TAGS_DONE = 'GET_TAGS_DONE';
export const ON_DEL_TAG_DONE = 'ON_DEL_TAG_DONE';

export const TAGS_CHANGE = 'TAGS_CHANGE';
export const READY_SELECT_TAGS = 'READY_SELECT_TAGS';
// 标签集做为select change
export const TAG_SELECT_CHANGE = 'TAG_SELECT_CHANGE';

// 交易逻辑数据增删改查
export const ADD_LOGIC = 'LOGIC.add';
export const EDIT_LOGIC = 'LOGIC.edit';
export const DEL_LOGIC = 'DEL_LOGIC';

export const ON_SET_LOGIC_DONE = 'LOGIC.edit.done';
export const ON_GET_LOGIC_DONE = 'ON_GET_LOGIC_DONE';
export const ON_DEL_LOGIC_DONE = 'ON_DEL_LOGIC_DONE';

// todo数据
export const SET_TODO = 'SET_TODO';
export const ADD_TODO = 'ADD_TODO';
export const EDIT_TODO = 'EDIT_TODO';
export const DEL_TODO = 'DEL_TODO';

export const SET_TODO_DONE = 'SET_TODO_DONE';
export const GET_TODO_DONE = 'GET_TODO_DONE';
export const DEL_TODO_DONE = 'DEL_TODO_DONE';

export const COLORS_BACKGROUND = ['#ff0000', '#0000ff', '#006400', '#ffff00', '#9400D3', '#000000'];
export let FroalaEditorConfig = {
    fontSizeDefaultSelection: '18',
    fontSize: ['14', '16', '18', '20', '22', '24', '26', '28', '30', '32'],
    colorsBackground: COLORS_BACKGROUND,
};

export default {
    ADD_SYSTEM,
    ON_SET_SYSTEM_DONE,
    EDIT_SYSTEM,
    ADD_TAG,
    EDIT_TAG,
    DEL_TAG,
    ON_DEL_TAG_DONE,
    ON_SET_TAG_DONE,
    GET_TAGS_DONE,
    READY_SELECT_TAGS,
    ADD_LOGIC,
    EDIT_LOGIC,
    DEL_LOGIC,
    ON_DEL_LOGIC_DONE,
    ON_SET_LOGIC_DONE,
    ON_GET_LOGIC_DONE,
    SET_TODO,
    ADD_TODO,
    EDIT_TODO,
    DEL_TODO,
    GET_TODO_DONE,
    SET_TODO_DONE,
    DEL_TODO_DONE,
    COLORS_BACKGROUND,
    FroalaEditorConfig
}

