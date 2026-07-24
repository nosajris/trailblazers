export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19')
];

export const server_loads = [0];

export const dictionary = {
		"/": [~2],
		"/bep-hub": [~3],
		"/connect": [~4],
		"/contact": [~5],
		"/demo": [6],
		"/demo/lucia": [~7],
		"/demo/lucia/login": [~8],
		"/events": [~9],
		"/events/[id]": [~10],
		"/faq": [~11],
		"/give": [~12],
		"/groups": [~13],
		"/messages": [~14],
		"/plan-a-visit": [~15],
		"/serve": [~16],
		"/stories": [~17],
		"/stories/[id]": [~18],
		"/watch": [~19]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';