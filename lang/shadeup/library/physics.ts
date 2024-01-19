import type RAPIER2DNamespace from '@dimforge/rapier2d/rapier';
import type RAPIER3DNamespace from '@dimforge/rapier3d/rapier';
import type { float, float2, float3 } from './types';

type RAPIER2D = typeof RAPIER2DNamespace;

export class PhysicsCollider2d {
	rapier: RAPIER2D;
	world: RAPIER2DNamespace.World;
	collider: RAPIER2DNamespace.Collider;

	constructor(
		rapier: RAPIER2D,
		world: RAPIER2DNamespace.World,
		collider: RAPIER2DNamespace.Collider
	) {
		this.rapier = rapier;
		this.world = world;
		this.collider = collider;
	}

	setTranslation(position: float2) {
		this.collider.setTranslation(toVec2(position));
	}

	setRotation(rotation: float) {
		this.collider.setRotation(rotation);
	}

	setSensor(isSensor: boolean) {
		this.collider.setSensor(isSensor);
	}

	setCollisionGroups(groups: int) {
		this.collider.setCollisionGroups(groups);
	}

	setCollidesWith(groups: int) {
		this.collider.setActiveCollisionTypes(groups);
	}

	setFriction(friction: float) {
		this.collider.setFriction(friction);
	}

	setRestitution(restitution: float) {
		this.collider.setRestitution(restitution);
	}

	setDensity(density: float) {
		this.collider.setDensity(density);
	}

	setMass(mass: float) {
		this.collider.setMass(mass);
	}

	setRadius(radius: float) {
		this.collider.setRadius(radius);
	}

	setHalfExtents(halfExtents: float2) {
		this.collider.setHalfExtents(toVec2(halfExtents));
	}
}
function toVec2(v: float2): RAPIER2DNamespace.Vector2 {
	return { x: v[0], y: v[1] };
}

function toVec3(v: float3): RAPIER3DNamespace.Vector {
	return { x: v[0], y: v[1], z: v[2] };
}

export class PhysicsRayCastResult2d {
	rapier: RAPIER2D;
	result: RAPIER2DNamespace.RayIntersection;

	constructor(rapier: RAPIER2D, result: RAPIER2DNamespace.RayIntersection) {
		this.rapier = rapier;
		this.result = result;
	}
}

export class PhysicsRigidBody2d {
	rapier: RAPIER2D;
	world: RAPIER2DNamespace.World;
	body: RAPIER2DNamespace.RigidBody;

	constructor(rapier: RAPIER2D, world: RAPIER2DNamespace.World, body: RAPIER2DNamespace.RigidBody) {
		this.rapier = rapier;
		this.world = world;
		this.body = body;
	}

	addBallCollider(radius: float): PhysicsCollider2d {
		let colDesc = this.rapier.ColliderDesc.ball(radius);
		let col = this.world.createCollider(colDesc, this.body);

		return new PhysicsCollider2d(this.rapier, this.world, col);
	}

	addBoxCollider(halfExtents: float2): PhysicsCollider2d {
		let colDesc = this.rapier.ColliderDesc.cuboid(halfExtents[0], halfExtents[1]);
		let col = this.world.createCollider(colDesc, this.body);

		return new PhysicsCollider2d(this.rapier, this.world, col);
	}

	addCapsuleCollider(radius: float, halfHeight: float): PhysicsCollider2d {
		let colDesc = this.rapier.ColliderDesc.capsule(radius, halfHeight);
		let col = this.world.createCollider(colDesc, this.body);

		return new PhysicsCollider2d(this.rapier, this.world, col);
	}

	addTriangleCollider(a: float2, b: float2, c: float2): PhysicsCollider2d {
		let colDesc = this.rapier.ColliderDesc.triangle(toVec2(a), toVec2(b), toVec2(c));
		let col = this.world.createCollider(colDesc, this.body);

		return new PhysicsCollider2d(this.rapier, this.world, col);
	}

	addConvexCollider(points: float2[]): PhysicsCollider2d {
		let floatarr = new Float32Array(points.length * 2);
		for (let i = 0; i < points.length; i++) {
			floatarr[i * 2 + 0] = points[i][0];
			floatarr[i * 2 + 1] = points[i][1];
		}
		let colDesc = this.rapier.ColliderDesc.convexHull(floatarr);
		if (!colDesc) throw new Error('Failed to create convex hull collider');
		let col = this.world.createCollider(colDesc, this.body);

		return new PhysicsCollider2d(this.rapier, this.world, col);
	}

	addHeightfieldCollider(heights: float[], scale: float2): PhysicsCollider2d {
		let arr = new Float32Array(heights.length);
		for (let i = 0; i < heights.length; i++) {
			arr[i] = heights[i];
		}
		let colDesc = this.rapier.ColliderDesc.heightfield(arr, toVec2(scale));
		let col = this.world.createCollider(colDesc, this.body);

		return new PhysicsCollider2d(this.rapier, this.world, col);
	}

	setTranslation(position: float2) {
		this.body.setTranslation(toVec2(position), true);
	}

	setRotation(rotation: float) {
		this.body.setRotation(rotation, true);
	}

	setVelocity(velocity: float2) {
		this.body.setLinvel(toVec2(velocity), true);
	}

	setAngularVelocity(velocity: float) {
		this.body.setAngvel(velocity, true);
	}

	addForce(force: float2) {
		this.body.addForce(toVec2(force), true);
	}

	addForceAtPoint(force: float2, point: float2) {
		this.body.addForceAtPoint(toVec2(force), toVec2(point), true);
	}

	addTorque(torque: float) {
		this.body.addTorque(torque, true);
	}

	setAdditionalMass(mass: float) {
		this.body.setAdditionalMass(mass, true);
	}

	setEnabled(enabled: boolean) {
		this.body.setEnabled(enabled);
	}

	sleep() {
		this.body.sleep();
	}

	wakeUp() {
		this.body.wakeUp();
	}

	setGravityScale(scale: float) {
		this.body.setGravityScale(scale, true);
	}

	setLinearDamping(damping: float) {
		this.body.setLinearDamping(damping);
	}

	setAngularDamping(damping: float) {
		this.body.setAngularDamping(damping);
	}

	isSleeping(): boolean {
		return this.body.isSleeping();
	}

	mass(): float {
		return this.body.mass() as float;
	}

	translation(): float2 {
		let t = this.body.translation();
		return [t.x as float, t.y as float];
	}

	rotation(): float {
		return this.body.rotation() as float;
	}

	velocity(): float2 {
		let t = this.body.linvel();
		return [t.x as float, t.y as float];
	}

	angularVelocity(): float {
		return this.body.angvel() as float;
	}

	isMoving(): boolean {
		return this.body.isMoving();
	}

	collider(index: int): PhysicsCollider2d {
		let collider = this.body.collider(index);
		if (!collider) throw new Error('Failed to get collider');
		return new PhysicsCollider2d(this.rapier, this.world, collider);
	}

	applyImpulse(impulse: float2) {
		this.body.applyImpulse(toVec2(impulse), true);
	}

	applyTorqueImpulse(impulse: float) {
		this.body.applyTorqueImpulse(impulse, true);
	}
}

export class PhysicsEngine2d {
	rapier: RAPIER2D;
	world: RAPIER2DNamespace.World;
	constructor(rapier: RAPIER2D) {
		this.rapier = rapier;
		this.world = new rapier.World(new rapier.Vector2(0.0, -9.81));
	}

	step() {
		this.world.step();
	}

	createRigidBody(
		position: float2,
		rotation: float,
		mode: 'dynamic' | 'fixed'
	): PhysicsRigidBody2d {
		let rbDesc =
			mode == 'dynamic'
				? this.rapier.RigidBodyDesc.dynamic()
				: mode == 'fixed'
				? this.rapier.RigidBodyDesc.fixed()
				: this.rapier.RigidBodyDesc.dynamic();
		rbDesc.setTranslation(position[0], position[1]);
		rbDesc.setRotation(rotation);
		let rb = this.world.createRigidBody(rbDesc);

		return new PhysicsRigidBody2d(this.rapier, this.world, rb);
	}

	bodies(): PhysicsRigidBody2d[] {
		let bodies = this.world.bodies;
		let result: PhysicsRigidBody2d[] = [];
		for (let i = 0; i < bodies.len(); i++) {
			result.push(new PhysicsRigidBody2d(this.rapier, this.world, bodies.get(i)!));
		}
		return result;
	}

	castRay(start: float2, end: float2, maxi: int): PhysicsRigidBody2d | null {
		let result = this.world.castRay(new this.rapier.Ray(toVec2(start), toVec2(end)), maxi, true);
		if (!result) return null;
		return new PhysicsRigidBody2d(this.rapier, this.world, result.collider.parent()!);
	}

	setGravity(gravity: float2) {
		this.world.gravity = toVec2(gravity);
	}
}

export class PhysicsEngine3d {
	constructor() {}
}

export namespace physics {
	export function engine2d(): PhysicsEngine2d {
		return new PhysicsEngine2d((window as any).RAPIER_2D);
	}
}
