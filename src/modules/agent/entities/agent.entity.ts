// src/modules/agent/entities/agent.entity.ts
@Column({ unique: true })
agentCode: string;

@Column({ nullable: true })
transactionVolumeTotal: number;

@Column({ nullable: true })
customerCount: number;

@Column({ nullable: true })
clientId: number;

@Column({ nullable: true })
projectId: number;

@Column({ nullable: true })
dapId: number;

@ManyToOne(() => Dap, (dap) => dap.agents, { nullable: true })
@JoinColumn({ name: 'dapId' })
dap: Dap;
