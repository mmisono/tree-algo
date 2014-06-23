(function($){
	"use strict";
	// drawing function reference : http://billmill.org/pymag-trees/
	// this program works on google chrome (because of yield)
	// in order to use yield in function*(),
	// you need to make chrome://flags enable-javascript-harmony on (2014/4)

	// -----------------------------------------------------------------------
	// Node
	function Node(value,left,right){
		this.value = value;
		this.left = left !== undefined ? left : null;
		this.right = right !== undefined ? right : null;
		this.thread = null;
		this.offset = 0;
		this.mod = 0;
		this.x = 0;
		this.y = 0;
	}

	Node.prototype.traverse_inorder = function* (){
		yield this;
		if(this.left != null){
			for(var t of this.left.traverse_inorder()){
				yield t;
			}
		}
		if(this.right != null){
			for(var t of this.right.traverse_inorder()){
				yield t;
			}
		}
	};

	Node.prototype.traverse_preorder = function* (){
		if(this.left != null){
			for(var t of this.left.traverse_preorder()){
				yield t;
			}
		}
		yield this;
		if(this.right != null){
			for(var t of this.right.traverse_preorder()){
				yield t;
			}
		}
	}

	Node.prototype.traverse_postorder = function* (){
		if(this.left != null){
			for(var t of this.left.traverse_postorder()){
				yield t;
			}
		}
		if(this.right != null){
			for(var t of this.right.traverse_postorder()){
				yield t;
			}
		}
		yield this;
	}

	Node.prototype.set_level = function(level){
		this.y = level;
		if(this.left !== null){
			this.left.set_level(level+1);
		}
		if(this.right !== null){
			this.right.set_level(level+1);
		}
	}

	// BinTree
	function BinTree(node){
		this.node = node !== undefined ? node : null;
	}

	BinTree.prototype.traverse_inorder= function*(){
		if(this.node !== null){
			for(var t of this.node.traverse_inorder()){
				yield t;
			}
		}
	}

	BinTree.prototype.traverse_preorder = function*(){
		if(this.node !== null){
			for(var t of this.node.traverse_preorder()){
				yield t;
			}
		}
	}

	BinTree.prototype.traverse_postorder = function*(){
		if(this.node !== null){
			for(var t of this.node.traverse_postorder()){
				yield t;
			}
		}
	}

	BinTree.prototype.set_level = function(){
		if(this.node !== null){
			this.node.set_level(0);
		}
	}


	// -----------------------------------------------------------------------
	// Binary Search Tree
	function BinSearchTree(){
		BinTree.apply(this,arguments);
	}
	BinSearchTree.prototype = Object.create(BinTree.prototype);
	BinSearchTree.prototype.constructor = BinSearchTree;

	BinSearchTree.prototype.insert = function(value){
		if(this.node === null){
			this.node = new Node(value);
			this.y = 0;
			return;
		}else{
			var p = this.node;
			var level = 1;
			while(true){
				if(value < p.value){
					if(p.left == null){
						p.left = new Node(value);
						p.left.y = level;
						return;
					}else{
						p = p.left;
						level += 1;
					}
				}else{
					if(p.right == null){
						p.right = new Node(value);
						p.right.y = level;
						return;
					}else{
						p = p.right;
						level += 1;
					}
				}
			}
		}
	}

	// -----------------------------------------------------------------------
	// drawing function
	
	function draw_tree_core(tree,rad_,d_){
		var canvas = $("#canvas")[0];
		var ctx = canvas.getContext("2d");
		var font = "15px Arial"
		var rad = rad_ !== undefined ? rad_ : 15;
		var mx = 40; // margin left
		var my = 40; // margin top
		var d = d_ !== undefined ? d_ : 10; // node distance

		// draw
		for(var t of tree.traverse_preorder()){
			var x = t.x;
			var y = t.y;

			// arc
			ctx.beginPath();
			ctx.fillStyle = "rgba(255,0,0,0.7)";
			ctx.arc(x*2.0*rad+mx,y*2*(rad+d)+my,rad,0,2*Math.PI);
			ctx.fill();

			// value
			ctx.beginPath();
			ctx.font = font;
			ctx.textAlign = "center";
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillText(t.value,x*2.0*rad+mx,y*2*(rad+d)+my+rad/4);
			ctx.stroke()


			// edge
			if(t.left != null){
				ctx.beginPath();
				ctx.strokeStyle = "rgba(255,0,0,0.5)";
				ctx.moveTo(x*2.0*rad+mx,y*2*(rad+d)+my);
				ctx.lineTo(t.left.x*2.0*rad+mx,(y+1)*2*(rad+d)+my);
				ctx.stroke();
			}
			if(t.right != null){
				ctx.beginPath();
				ctx.strokeStyle = "rgba(255,0,0,0.5)";
				ctx.moveTo(x*2.0*rad+mx,y*2*(rad+d)+my);
				ctx.lineTo(t.right.x*2.0*rad+mx,(y+1)*2*(rad+d)+my);
				ctx.stroke();
			}
		}
	}
	
	// draw tree
	// 問題点: preorderで描画していくので，x方向の位置を求めるために
	// 2回探索する必要がある (一度にノードと辺を描画できない)
	function draw_tree_simple(tree,rad_,d_){
		clear();
		if(tree.node === null){
			return;
		}


		var x = 0;
		for(var t of tree.traverse_preorder()){
			var y = t.y;
			t.x = x;
			x += 1;
		}

		draw_tree_core(tree,rad_,d_);
	}

	// 各深さごとに位置を記憶して，左から順に埋めていく方法
	function draw_tree_left(tree,rad_,d_){
		clear();
		if(tree.node === null){
			return;
		}

		var next_pos = []
		for(var t of tree.traverse_postorder()){
			var y = t.y;
			if(next_pos[y] === undefined){
				next_pos[y] = 0;
			}else{
				next_pos[y] += 1;
			}
			var x = next_pos[y];
			t.x = x;
			x += 1;
		}

		draw_tree_core(tree,rad_,d_);
	}

	// 親を子の中央に配置 (O(n))
	function draw_tree_center(tree,rad_,d_){
		clear();
		if(tree.node === null){
			return;
		}

		var next_pos = [];
		var offset = [];

		for(var t of tree.traverse_postorder()){
			var x = 0;
			var y = t.y;
			if(next_pos[y] === undefined){
				next_pos[y] = 0;
			}
			if(offset[y] === undefined){
				offset[y] = 0;
			}

			if(t.left === null && t.right === null){
				// leaf
				x = next_pos[y];
				next_pos[y] += 2;
			}else{
				var count = 0;
				if(t.left !== null){
					count += 1;
					x += t.left.x;
				}
				if(t.right !== null){
					count += 1;
					x += t.right.x;
				}
				if(t.left !== null && t.right !== null){
					x /= 2;
				}else if(t.left === null){
					 x -= 1;
				}else{
					 x += 1;
				}

				offset[y] = Math.max(offset[y],next_pos[y]-x);
				x += offset[y];
				next_pos[y] = x+2;
			}
			t.x = x;
			t.mod = offset[y];
		}

		// shift children
		function shift_child(node,mod){
			node.x += mod;
			if(node.left !== null){
				shift_child(node.left,node.mod+mod);
			}
			if(node.right !== null){
				shift_child(node.right,node.mod+mod);
			}
		}
		shift_child(tree.node,0);

		draw_tree_core(tree,rad_,d_);
	}

	// tilford-reingold (?)
	function draw_tree_tr(tree,rad_,d_){
		clear();
		if(tree.node === null){
			return;
		}

		function next_right(node){
			if(node.thread !== null){
				return node.thread;
			}
			if(node.right !== null){
				return node.right;
			}
			if(node.left !== null){
				return node.left;
			}
			return null;
		}

		function next_left(node){
			if(node.thread !== null){
				return node.thread;
			}
			if(node.left !== null){
				return node.left;
			}
			if(node.right !== null){
				return node.right;
			}
			return null;
		}

		function contour(left,right,max_offset,loffset,roffset,left_outer,right_outer){
			if(roffset === undefined) roffset = 0;
			if(loffset === undefined) loffset = 0;
			if(left_outer === undefined) left_outer = left;
			if(right_outer === undefined) right_outer = right;

			// var d = (left.x + loffset) - (right.x + roffset);
			var d = 0;
			if(left !== null){
				d += left.x+loffset;
			}
			if(right !== null){
				d -= (right.x + roffset);
			}
			if(max_offset === undefined || d > max_offset){
				max_offset = d;
			}

			var lo = left_outer !== null ? next_left(left_outer) : null;
			var li = left !== null ? next_right(left) : null;
			var ri = right !== null ? next_left(right) : null;
			var ro = right_outer !== null ? next_right(right_outer) : null;

			if(li !== null && ri !== null){
				loffset += left.offset;
				roffset += right.offset;
				return contour(li,ri,max_offset,loffset,roffset,left_outer,right_outer);
			}

			return [li,ri,max_offset,loffset,roffset,lo,ro];
		}

		function fix_subtrees(left,right){
			var r = contour(left,right); 
			var li = r[0];
			var ri = r[1];
			var offset = r[2];
			var loffset = r[3];
			var roffset = r[4];
			var lo = r[5];
			var ro = r[6];
			
			offset +=  1;
			var d = 0;
			if(right !== null && left !== null){
				offset += (right.x + offset + left.x) % 2;
			}

			if(right !== null){
				right.mod = offset;
				right.x += offset;

				if(right.left !== null || right.right !== null){
					roffset += offset;
				}
			}

			if(ri !== null && lo !== null){
				lo.thread = ri;
				lo.mod = roffset - loffset;
			}else if(li !== null && ro !== null){
				ro.thread = li;
				ro.mod = loffset - roffset;
			}

			if(left !== null && right !== null){
				return (left.x + right.x)/2;
			}else if(left === null){
				return right.x - 1;
			}else{
				return left.x + 1;
			}
		}

		for(var t of tree.traverse_postorder()){
			var offset = 0;
			var x = 0;
			var y = t.y;
			t.mod = 0;

			if(t.left === null && t.right === null){
				// leaf
				x = 0;
			}else{
				x = fix_subtrees(t.left,t.right);
			}
			t.x = x;
		}

		// shift children
		function shift_child(node,mod){
			node.x += mod;
			if(node.left !== null){
				shift_child(node.left,node.mod+mod);
			}
			if(node.right !== null){
				shift_child(node.right,node.mod+mod);
			}
		}
		function shift_child2(node,mod){
			node.x += mod;
			if(node.left !== null){
				shift_child2(node.left,mod);
			}
			if(node.right !== null){
				shift_child2(node.right,mod);
			}
		}
		shift_child(tree.node,0);

		var left_most = Infinity;
		for(var t of tree.traverse_preorder()){
			if(t.x < left_most){
				left_most = t.x;
			}
		}
		if(left_most < 0){
			shift_child2(tree.node,-left_most);
		}

		draw_tree_core(tree,rad_,d_);
	}

	function clear(){
		var canvas = $("#canvas")[0];
		canvas.width = 1200;
		canvas.height = 580;

		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.fillRect(0,0,canvas.width, canvas.height);
		ctx.strokeStyle = "rgb(0,0,0)";
		ctx.moveTo(0,0);
		ctx.lineTo(canvas.width,0);
		ctx.lineTo(canvas.width,canvas.height);
		ctx.lineTo(0,canvas.height);
		ctx.lineTo(0,0);
		ctx.stroke()
	}

	// -----------------------------------------------------------------------
	// entry point
	
	$(function(){
		var root = make_symmetric_bin_search_tree();
		var draw_tree = draw_tree_simple;
		draw();

		function draw(){
			var rad = parseInt($("#rad").val());
			var d = parseInt($("#distance").val());
			draw_tree(root,rad,d);
		}

		function reset(){
			root = new BinSearchTree();
			draw();
		}

		function change_draw_func(f){
			draw_tree = f;
			draw();
		}

		function change_root(r){
			root = r;
			draw();
		}

		$("#insert").click(function(){
			var val = parseInt($("#input").val());
			if(isNaN(val)){
				return;
			}
			if(root == null){
				root = new BinSearchTree(val);
			}else{
				root.insert(val);
			}
			draw();
		});
		$("#reset").click(function(){
			reset();
		});
		$("#rad").change(function(){
			draw();
		});
		$("#distance").change(function(){
			draw();
		});
		$("#draw_simple").change(function(){
			change_draw_func(draw_tree_simple);
		});
		$("#draw_left").change(function(){
			change_draw_func(draw_tree_left);
		});
		$("#draw_center").change(function(){
			change_draw_func(draw_tree_center);
		});
		$("#draw_tr").change(function(){
			change_draw_func(draw_tree_tr);
		});
		$("#sample_tree1").click(function(){
			change_root(make_test_bin_tree1());
		});
		$("#sample_bin_tree1").click(function(){
			change_root(make_test_bin_search_tree1());
		});
		$("#sample_bin_tree2").click(function(){
			change_root(make_test_bin_search_tree2());
		});
		$("#sample_bin_tree3").click(function(){
			change_root(make_test_bin_search_tree3());
		});
		$("#sample_symmetric_tree").click(function(){
			change_root(make_symmetric_bin_search_tree());
		});
	});


	// -----------------------------------------------------------------------
	function make_test_bin_tree1(){
		//         1
		//        / \
		//       2   7
		//      / \
		//     3   4
		//    /     \
		//   5       6
		var tree =  new BinTree(
				new Node(1,
					new Node(2,
						new Node(3,
							new Node(5),
						null),
						new Node(4,
							null,
							new Node(6))
						),
					new Node(7)));
		tree.node.set_level(0);
		return tree;
	}

	function make_test_bin_search_tree1(){
		//         5
		//        / \
		//       3   8
		//      / \   \
		//     1   4  10
		//            /
		//           9
		var root = new BinSearchTree();
		root.insert(5);
		root.insert(3);
		root.insert(8);
		root.insert(1);
		root.insert(10);
		root.insert(4);
		root.insert(9);
		return root;
	}

	function make_test_bin_search_tree2(){
		var root = new BinSearchTree();
		root.insert(10);
		root.insert(20);
		root.insert(0);
		root.insert(1);
		root.insert(2);
		root.insert(3);
		return root;
	}

	function make_test_bin_search_tree3(){
		var root = new BinSearchTree();
		root.insert(10);
		root.insert(0);
		root.insert(20);
		root.insert(19);
		root.insert(18);
		root.insert(17);
		root.insert(16);
		root.insert(15);
		root.insert(14);
		return root;
	}

	function make_symmetric_bin_search_tree(){
		var root = new BinSearchTree()
		root.insert(100)
		root.insert(90)
		root.insert(110)
		root.insert(105)
		root.insert(120)
		root.insert(115)
		root.insert(130)
		root.insert(125)
		root.insert(190)
		root.insert(180)
		root.insert(200)
		root.insert(185)
		root.insert(170)
		root.insert(175)
		root.insert(160)
		root.insert(165)
		root.insert(150)

		root.insert(95)
		root.insert(80)
		root.insert(85)
		root.insert(70)
		root.insert(75)
		root.insert(10)
		root.insert(5)
		root.insert(20)
		root.insert(15)
		root.insert(30)
		root.insert(25)
		root.insert(40)
		root.insert(35)
		root.insert(50)

		return root;
	}

	function test_bin_tree(){
		var root = make_test_bin_tree1();
		for(var t of root.traverse_postorder()){
			console.log(t.value);
		}
	}

	function test_bin_search_tree(){
		var root = make_test_bin_search_tree1();
		for(var t of root.traverse_inorder()){
			console.log(t.y+":"+t.value);
		}
		for(var t of root.traverse_preorder()){
			console.log(t.y+":"+t.value);
		}
		for(var t of root.traverse_postorder()){
			console.log(t.y+":"+t.value);
		}
	}
})(jQuery);
