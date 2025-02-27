import Model, { ApplyType } from '../../../common/model/Model';
import SnapshotEntity from '../entity/SnapshotEntity';
import ChangesetService from './ChangesetService';

export const SNAPSHOT_NUM = 100;

export default class SnapshotService {
  static async save(content: string, version: number, codeId: string) {
    const snapshot = new SnapshotEntity();
    snapshot.codeId = codeId;
    snapshot.content = content;
    snapshot.version = version;
    await snapshot.save();
    return snapshot;
  }

  static async get(codeId: string, version: number) {
    const num = version % SNAPSHOT_NUM;
    const baseVersion = version - num;
    const snapshot = await SnapshotEntity.findOneOrFail({ version: baseVersion, codeId });
    const model = new Model(snapshot.content);
    if (num === 0) {
      return model;
    }
    const changesets = await ChangesetService.getByRange(codeId, baseVersion, version);
    model.applyChangesets(changesets.map(changeset => ({
      ...changeset,
      operations: changeset.getOperations(),
    })), ApplyType.Server);
    return model;
  }
}
