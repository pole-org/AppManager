import React, {PureComponent} from 'react';

const Component = {};

/**
 * 注入权限验证
 * @param code
 * @returns {function(*)}
 */
Component.Role = (code) => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      componentWillMount() {
        const {dispatch} = this.props;
        dispatch({
          type: 'user/validRole',
          payload: {
            roleCode: code,
          },
        });
      }

      render() {
        return <WrappedComponent {...this.props}/>;
      }
    };
  };
};

/**
 * 注入模型
 * @param model
 * @returns {function(*)}
 */
Component.Model = (model) => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      render() {
        const {dispatch} = this.props;
        const _model = {
          name: model,
          get: (payload) => {
            return dispatch({
              type: `${model}/get`,
              payload,
            });
          },
          add: (payload) => {
            return dispatch({
              type: `${model}/add`,
              payload,
            });
          },
          edit: (payload) => {
            return dispatch({
              type: `${model}/edit`,
              payload,
            });
          },
          delete: (payload) => {
            return dispatch({
              type: `${model}/delete`,
              payload,
            });
          },
          save: (isAdd, payload) => {
            const action = isAdd ? 'add' : 'edit';
            return dispatch({
              type: `${model}/${action}`,
              payload,
            });
          },
          call: (type, payload) => {
            return dispatch({
              type: `${model}/${type}`,
              payload,
            });
          },
          dispatch: ({type, payload}) => {
            return dispatch({
              type: `${model}/${type}`,
              payload,
            });
          },
          setState: (payload) => {
            return dispatch({
              type: `${model}/setState`,
              payload,
            });
          },
          push: (path) => {
            return dispatch({
              type: `${model}/changeRoute`,
              payload: {
                path
              }
            });
          },
          clear: () => {
            return dispatch({
              type: `${model}/clear`,
            });
          },
          resetState: () => {
            return dispatch({
              type: `${model}/resetState`,
            });
          },
          resetPage: () => {
            return dispatch({
              type: `${model}/resetPage`,
            });
          }
        }
        return <WrappedComponent model={_model} {...this.props}/>;
      }
    };
  };
};

/**
 * 注入分页
 * @param model
 * @returns {function(*)}
 */
Component.Pagination = ({model}) => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      render() {
        const {dispatch} = this.props;
        const pagination = ({total, pageIndex}, action) => {
          return {
            showSizeChanger: true,
            hideOnSinglePage: false,
            pageSizeOptions: ["10", "20", "40", "60", "100", "200"],
            showTotal: (value) => {
              return `共 ${value}条数据`;
            },
            total,
            current: pageIndex,
            pageSize: localStorage.getItem('pageSize') === null ? 10
              : parseInt(localStorage.getItem('pageSize')),
            onChange: (current) => {
              dispatch({
                type: `${model}/setState`,
                payload: {
                  pageIndex: current,
                },
              }).then(() => {
                action();
              });
            },
            onShowSizeChange: (current, size) => {
              localStorage.setItem('pageSize', size);
              dispatch({
                type: `${model}/setState`,
                payload: {
                  pageSize: size,
                  pageIndex: 1,
                },
              }).then(() => {
                action();
              });
            },
          };
        }
        return <WrappedComponent pagination={pagination} {...this.props}/>;
      }
    };
  };
};

Component.Option = (name, params) => {
  return (WrappedComponent) => {
    return class extends PureComponent {
      componentDidMount() {
        const {dispatch} = this.props;
        dispatch({
          type: `global/${name}`,
          payload: params,
        });
        // WrappedComponent.prototype.componentDidMount();
      }

      render() {
        return <WrappedComponent {...this.props}/>;
      }
    };
  };
};


export default Component;

