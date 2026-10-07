import logging

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class EvolutaJobRunner(models.Model):
    _name = "evoluta.job.runner"
    _description = "Executor mínimo de jobs (cron)"

    name = fields.Char(default="runner")

    @api.model
    def _run_pending_jobs(self, limit=5):
        from odoo.addons.queue_job.job import Job

        pending = self.env["queue.job"].search(
            [("state", "=", "pending")], order="date_created", limit=limit
        )
        for rec in pending:
            job = Job._load_from_db_record(rec)
            try:
                job.set_started()
                job.store()
                job.perform()
                job.set_done()
                job.store()
            except Exception as err:  # noqa: BLE001 - demo runner
                _logger.exception("Evoluta job failed: %s", rec.uuid)
                job.set_failed(exc_info=str(err))
                job.store()
        return True
