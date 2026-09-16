import type { MomentumRepository } from './repository.ts';

export class MomentumService {
  private readonly repo: MomentumRepository;

  constructor(repo: MomentumRepository) {
    this.repo = repo;
  }

  captureContext(input: Parameters<MomentumRepository['captureContext']>[0]) {
    return this.repo.captureContext(input);
  }

  createOpenLoop(input: Parameters<MomentumRepository['createOpenLoop']>[0]) {
    return this.repo.createOpenLoop(input);
  }

  getOpenLoops(input?: Parameters<MomentumRepository['getOpenLoops']>[0]) {
    return this.repo.getOpenLoops(input);
  }

  getWaitingOn(limit?: number) {
    return this.repo.getWaitingOn(limit);
  }

  resolveOpenLoop(id: number) {
    return this.repo.resolveOpenLoop(id);
  }

  getContext(input: Parameters<MomentumRepository['getContextFor']>[0]) {
    return this.repo.getContextFor(input);
  }

  searchContext(query: string, limit?: number) {
    return this.repo.searchContext(query, limit);
  }

  recordDecision(input: Parameters<MomentumRepository['recordDecision']>[0]) {
    return this.repo.recordDecision(input);
  }

  getRecentDecisions(input?: Parameters<MomentumRepository['getRecentDecisions']>[0]) {
    return this.repo.getRecentDecisions(input);
  }

  dailyBrief(input?: Parameters<MomentumRepository['dailyBrief']>[0]) {
    return this.repo.dailyBrief(input);
  }

  stats() {
    return this.repo.stats();
  }
}
