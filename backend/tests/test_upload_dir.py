"""Test resolusi folder upload yang resilient terhadap folder tidak writable."""

import os
import tempfile

from main import _resolve_upload_dir, _check_upload_dir_writable


def test_resolve_picks_first_writable(tmp_path):
    writable = str(tmp_path / "uploads_ok")
    result = _resolve_upload_dir([writable])
    assert result == writable
    assert os.path.isdir(result)
    assert _check_upload_dir_writable(result)


def test_resolve_falls_back_when_first_unmakeable(tmp_path):
    # Kandidat pertama mustahil dibuat (path di bawah file, bukan folder) → fallback.
    a_file = tmp_path / "afile"
    a_file.write_text("x")
    bad = str(a_file / "sub" / "uploads")  # makedirs akan gagal: parent adalah file
    good = str(tmp_path / "uploads_fallback")

    result = _resolve_upload_dir([bad, good])
    assert result == good
    assert _check_upload_dir_writable(result)


def test_resolve_skips_empty_candidates(tmp_path):
    good = str(tmp_path / "uploads2")
    result = _resolve_upload_dir([None, "", good])
    assert result == good


def test_resolve_returns_last_when_all_fail():
    # Semua kandidat None/empty → kembalikan fallback tmp default (tidak crash).
    result = _resolve_upload_dir([None, ""])
    assert result  # tidak None/empty
    assert "laporin_uploads" in result
    assert result.startswith(tempfile.gettempdir())
