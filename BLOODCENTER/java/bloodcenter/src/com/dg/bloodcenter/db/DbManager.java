package com.dg.bloodcenter.db;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.dg.bloodcenter.model.BloodBank;
import com.dg.bloodcenter.model.BloodCenter;
import com.dg.bloodcenter.model.BloodDonee;
import com.dg.bloodcenter.model.BloodJaego;
import com.dg.bloodcenter.model.DoneeBooking;
import com.dg.bloodcenter.model.Donor;
import com.dg.bloodcenter.model.KeepBlood;

public class DbManager {
	private String CLASS = "oracle.jdbc.driver.OracleDriver";
	private String URL = "jdbc:oracle:thin:@localhost:1521:XE";
	private String USER = "test";
	private String PASSWD = "1234";
	protected Connection con;
	private static DbManager inst = null;
	protected Statement st;
	protected ResultSet rs;

//DDD
	public DbManager() {
		dbConnect();
	}

	public static DbManager getInst() {
		if (inst == null) {
			inst = new DbManager();
		}
		return inst;
	}

	public Connection getCon() {
		return con;
	}

	public void dbConnect() {
		try {
			Class.forName(CLASS);
			con = DriverManager.getConnection(URL, USER, PASSWD);
			con.setAutoCommit(false);
			System.out.println("오라클 접속 성공");
		} catch (ClassNotFoundException e) {
			System.out.println("오라클 드라이버를 못찾음!!");
			e.printStackTrace();
		} catch (SQLException e) {
			showErr(e);
		}
	}

	public void dbClose() {
		// 오라클 접속 해제
		if (con != null) {
			System.out.println("오라클 접속 해제");
			try {
				con.close();
			} catch (SQLException e) {
				showErr(e);
			}
		}
	}

	public void showErr(SQLException e) {
		System.out.println("######################");
		System.out.println("오류 코드:" + e.getErrorCode());
		System.out.println("오류 내용:" + e.getMessage());
		System.out.println("######################");
		e.printStackTrace();
	}

// ---------------------------현식 시작------------------------   
	public void bloodJaego() {
		PreparedStatement pstmt = null;
		String sql = "select bd.do_bloodtype, sum(bb.bo_bloodvolume) as \"혈액총량\" "
				+ "from blood_booking bb join blood_donor bd "
				+ "on bb.donor_id = bd.donor_id group by bd.do_bloodtype";
		try {
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();
			int i = 1;
			while (rs.next()) {
				System.out.println(rs.getString("do_bloodtype") + "\n" + "오늘의 혈액보유량:" + rs.getInt("혈액총량") + "ml");
				System.out.println("----------------------------");
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			showErr(e);
		}
	}

	public List<BloodJaego> bloodJaego2() {
		List<BloodJaego> bklist = new ArrayList<>();

		PreparedStatement pstmt = null;
		String sql = "select bd.do_bloodtype, sum(bb.bo_bloodvolume) as \"혈액총량\" "
				+ "from blood_booking bb join blood_donor bd "
				+ "on bb.donor_id = bd.donor_id group by bd.do_bloodtype";
		try {
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();

			while (rs.next()) {
				bklist.add(new BloodJaego(rs.getString("do_bloodtype"), rs.getInt("혈액총량")));
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			showErr(e);
		}
		return bklist;
	}

	public List<BloodJaego> bloodJaego3() {
		List<BloodJaego> bklist = new ArrayList<>();

		PreparedStatement pstmt = null;
		String sql = "SELECT bd.do_bloodtype AS \"혈액형\",SUM(bb.bo_bloodvolume) AS \"혈액총량\" "
				+ "FROM blood_booking bb JOIN blood_donor bd ON bb.donor_id = bd.donor_id "
				+ "JOIN blood_keep bk ON bb.booking_id = bk.booking_id "
				+ "WHERE bk.status is null or bk.status = '폐기예정'" + "group by bd.do_bloodtype ";
		try {
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();

			while (rs.next()) {
				bklist.add(new BloodJaego(rs.getString("혈액형"), rs.getInt("혈액총량")));
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			showErr(e);
		}
		return bklist;
	}

	// 헌혈 예약 변경 기능
	public void modifyDonation(String bookingId, String newDonationType, int newBloodVolume, String newBookDate,
			String newGift) {
		PreparedStatement pstmt = null;
		// 네 테이블 구조(blood_booking)에 맞춰서 SQL 쿼리 컬럼 이름 수정!
		// booking_id, bo_donationtype, bo_bloodvolume, bo_booktime, bo_gift
		String sql = "UPDATE blood_booking SET bo_donationtype = ?, bo_bloodvolume = ?, bo_booktime = to_date(?,'YY/MM/DD'), bo_gift = ? WHERE booking_id = ?"; // <--
		// 컬럼
		// 이름
		// 수정!

		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, newDonationType); // 새로운 헌혈 종류 -> bo_donationtype 컬럼에
			pstmt.setInt(2, newBloodVolume); // 새로운 혈액량 -> bo_bloodvolume 컬럼에
			pstmt.setString(3, newBookDate); // 새로운 예약일자 -> bo_booktime 컬럼에 (to_date로 변환)
			pstmt.setString(4, newGift); // 새로운 사은품 -> bo_gift 컬럼에
			pstmt.setString(5, bookingId); // 변경할 예약 ID -> booking_id 컬럼에

			int rowsAffected = pstmt.executeUpdate(); // SQL 실행

			if (rowsAffected > 0) {
				System.out.println(bookingId + " 예약이 성공적으로 변경되었습니다! ");
				con.commit(); // 성공하면 저장!
			} else {
				// 해당 ID의 예약이 없을 경우
				System.out.println("예약 ID " + bookingId + "를 찾을 수 없습니다. 변경할 예약이 없어요.");
				// 이때는 롤백할 필요 없어.
			}

		} catch (SQLException e) {
			showErr(e); // 오류 출력
			try {
				con.rollback(); // 실패하면 되돌리기!
				System.out.println(bookingId + " 예약 변경 중 오류가 발생...");
			} catch (SQLException e1) {
				e1.printStackTrace();
				System.out.println("변경 실패 후 롤백 중에도 오류 발생");
			}
		} finally {
			if (pstmt != null) {
				try {
					pstmt.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
			// Connection은 여기서 닫으면 안 돼! DbManager에서 관리!
		}
	}

	// 헌혈 예약 취소 기능
	// bookingId: 취소할 예약의 고유 ID
	public void cancelDonation(String bookingId) {
		PreparedStatement pstmt = null;
		// 네 테이블 구조에 상태 컬럼이 없으므로, 해당 예약 row를 삭제하는 방식으로 처리
		// 만약 상태 컬럼을 추가한다면, UPDATE 쿼리로 변경해야 해!
		String sql = "DELETE FROM blood_booking WHERE booking_id = ?"; // <-- DELETE 쿼리로 변경하고 booking_id 컬럼 사용!

		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, bookingId); // 취소할 예약 ID -> booking_id 컬럼에

			int rowsAffected = pstmt.executeUpdate(); // SQL 실행하고 삭제된 행 개수 확인

			if (rowsAffected > 0) {
				System.out.println(bookingId + " 예약이 성공적으로 취소되었습니다."); // 취소 완료!
				con.commit(); // 성공하면 저장!
			} else {
				// 해당 ID의 예약이 없을 경우
				System.out.println("예약 ID " + bookingId + "를 찾을 수 없습니다. 취소할 예약이 없어요.");
				// 이때는 롤백할 필요 없어.
			}

		} catch (SQLException e) {
			showErr(e); // 오류 출력
			try {
				con.rollback(); // 실패하면 되돌리기!
				System.out.println(bookingId + " 예약 취소 중 오류가 발생했어요.");
			} catch (SQLException e1) {
				e1.printStackTrace();
				System.out.println("취소 실패 후 롤백 중에도 오류 발생...");
			}
		} finally {
			if (pstmt != null) {
				try {
					pstmt.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
			// Connection은 여기서 닫으면 안 돼! DbManager에서 관리!
		}
	}

// ----------------------------현식끝-----------------------   

// =======정서 시작 ===============
	public void bloodInfo(String asdf) {
		PreparedStatement pstmt = null;
		String sql = "select booking_id, bo_booktime, bo_donationtype, bo_bloodvolume "
				+ "from blood_booking bo, blood_donor do " + "where do.donor_id = bo.donor_id and do.donor_id = ? "
				+ "order by bo.bo_booktime asc";

		String countSql = "select count(*) as cnt " + "from blood_booking bo, blood_donor do "
				+ "where do.donor_id = bo.donor_id and do.donor_id = ?";

		try {
			pstmt = con.prepareStatement(countSql);
			pstmt.setString(1, asdf);
			ResultSet countRs = pstmt.executeQuery();

			int totalcount = 0;
			if (countRs.next()) {
				totalcount = countRs.getInt("cnt");
			}
			countRs.close();
			pstmt.close();

			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, asdf);
			ResultSet rs = pstmt.executeQuery();

			boolean hasdata = false;

			while (rs.next()) {
				hasdata = true;
				System.out.println("예약 ID: " + rs.getString("booking_id"));
				System.out.println("예약 시간: " + rs.getString("bo_booktime"));
				System.out.println("헌혈 유형: " + rs.getString("bo_donationtype"));
				System.out.println("혈액량: " + rs.getString("bo_bloodvolume"));
				System.out.println("---------------------------");
			}
			rs.close();
			pstmt.close();

			if (hasdata) {
				System.out.println("총 헌혈 횟수: " + totalcount + "회");
			} else {
				System.out.println("등록된 id가 존재하지 않습니다ㅠㅠ");
			}
		} catch (SQLException e) {
			showErr(e);
		}
	}

	public void getDonorsByBloodType(String bloodType) {
		PreparedStatement pstmt = null;
		String sql = "SELECT * FROM blood_donor WHERE do_bloodtype = ?";

		try {
			pstmt = con.prepareStatement(sql);

			pstmt.setString(1, bloodType);

			rs = pstmt.executeQuery();

			boolean hasData = false;

			System.out.println("=== " + bloodType + " 혈액형 헌혈자 목록 ===");

			while (rs.next()) {
				hasData = true;
				System.out.println("헌혈자 ID: " + rs.getString("donor_id"));
				System.out.println("이름: " + rs.getString("do_name"));
				System.out.println("주민등록번호: " + rs.getString("do_rrnumber"));
				System.out.println("성별: " + rs.getString("do_gender"));
				System.out.println("주소: " + rs.getString("do_address"));
				System.out.println("전화번호: " + rs.getString("do_tel"));
				System.out.println("혈액형: " + rs.getString("do_bloodtype"));
				System.out.println("-------------------------");
			}

			if (!hasData) {
				System.out.println("해당 혈액형의 헌혈자가 없습니다.");
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			showErr(e);
		}
	}

	public void showbooking() {
		PreparedStatement pstmt = null;
		String sql = "select booking_id, center_id, bb.donor_id, bo_donationtype, bo_bloodvolume, bo_booktime, bo_interview, bo_gift, do_bloodtype\r\n"
				+ "from blood_booking bb, blood_donor bd where bb.donor_id = bd.donor_id \r\n" + "order by booking_id";
		try {
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();
			int i = 1;
			while (rs.next()) {
				System.out.println("예약번호: " + rs.getString("booking_id"));
				System.out.println("헌혈받을곳: " + rs.getString("center_id"));
				System.out.println("헌혈자코드: " + rs.getString("donor_id"));
				System.out.println("헌혈종류: " + rs.getString("bo_donationtype"));
				System.out.println("헌혈량: " + rs.getInt("bo_bloodvolume"));
				System.out.println("예약날짜: " + rs.getString("bo_booktime"));
				System.out.println("전자문진: " + rs.getString("bo_interview"));
				System.out.println("혈액형: " + rs.getString("do_bloodtype"));
				System.out.println("----------------------------");
			}
			rs.close();
		} catch (SQLException e) {
			showErr(e);
		}
	}

	// 윤정서 끝 --------------------------------------------------------------------
	// DG 시작-----------------------------------------------------------------------
	public void bloodTrash(String bloodKey, String sau) { // 폐기할 고객 정보
		PreparedStatement pstmt = null;
		String status = bloodGetStatus(bloodKey);
		////////////////////////////////////////
		String sql = null;
		try {
			if (status == null) {
				sql = "UPDATE blood_keep SET dis_comment = ?, status='폐기' WHERE blood_key = ?";
				pstmt = con.prepareStatement(sql);
				pstmt.setString(1, sau);
				pstmt.setString(2, bloodKey);
			} else if (status.equals("폐기예정")) {
				sql = "UPDATE blood_keep SET dis_comment = ?, status='폐기' WHERE blood_key = ?";
				pstmt = con.prepareStatement(sql);
				pstmt.setString(1, sau);
				pstmt.setString(2, bloodKey);
			}
			else {
				System.out.println("이미 처리된 데이터 입니다");
				return;
			}
			pstmt.executeUpdate();
			pstmt.close();
			con.commit();
		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				showErr(e1);
			}
		}
	}

	public List<KeepBlood> showBloodTrash(String bloodkey) {
		List<KeepBlood> KbList = new ArrayList<>();
		PreparedStatement pstmt = null;
		String sql = "select * from blood_center bh, blood_bank bb, blood_keep bp where bp.bank_id = bb.bank_id and bp.center_id = bh.center_id and bp.blood_key= ?";

		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, bloodkey);
			rs = pstmt.executeQuery();
			while (rs.next()) {
				BloodCenter bh = new BloodCenter(rs.getString("center_id"), rs.getString("c_name"),
						rs.getString("c_address"), rs.getString("c_tel"));

				BloodBank bb = new BloodBank(rs.getString("bank_id"), rs.getString("bk_name"), rs.getString("bk_addr"),
						rs.getString("bk_tel"));

				KeepBlood kb = new KeepBlood(rs.getString("blood_key"), bh, bb, rs.getString("st_date"),
						rs.getString("end_date"), rs.getString("status"), rs.getString("dis_comment"));

				KbList.add(kb);

			}
			rs.close();
			pstmt.close();

			con.commit();
		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				showErr(e1);
			}
		}
		return KbList;
	}

	// 현재 입력한 id의 상태값을 가져옴 
	public String bloodGetStatus(String bloodKey) { //셀렉트문으로 status값을 받아서 리턴해줌
		PreparedStatement pstmt = null;
		String sql = "select status from blood_keep where blood_key = ?";
		String status = null;

		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, bloodKey);
			rs = pstmt.executeQuery();
			while (rs.next()) {
				status = rs.getString("status");
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			showErr(e);
		}
		return status;
	}// 셀릭트문으로 status값만 따로 리턴해줌

	public void bloodBring(String bookingId, String day) { // 앞에서 만든 메서드를 받아서 if문을 사용해서 업데이트해줌
		PreparedStatement pstmt = null;
		//////////// 테스트 코드 /////////////////
		String status = bloodGetStatus(bookingId);
		////////////////////////////////////////
		String sql = null;
		try {
			if (status == null) {
				sql = "UPDATE blood_keep SET dis_comment = ?, status='사용됨' WHERE blood_key = ?";
				pstmt = con.prepareStatement(sql);
				pstmt.setString(1, day);
				pstmt.setString(2, bookingId);
			} else if (status.equals("폐기예정")) {
				sql = "UPDATE blood_keep SET dis_comment = ?, status='사용됨' WHERE blood_key = ?";
				pstmt = con.prepareStatement(sql);
				pstmt.setString(1, day);
				pstmt.setString(2, bookingId);
			}
			else {
				System.out.println("이미 처리된 데이터 입니다");
				return;
			}
			pstmt.executeUpdate();
			pstmt.close();
			con.commit();
		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				showErr(e1);
			}
		}
	}

	public List<KeepBlood> showBloodBring(String bloodkey) {
		List<KeepBlood> KbListB = new ArrayList<>();
		PreparedStatement pstmt = null;
		String sql = "select * from blood_center bh, blood_bank bb, blood_keep bp where bp.bank_id = bb.bank_id and bp.center_id = bh.center_id and bp.blood_key= ?";

		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, bloodkey);
			rs = pstmt.executeQuery();
			while (rs.next()) {
				BloodCenter bh = new BloodCenter(rs.getString("center_id"), rs.getString("c_name"),
						rs.getString("c_address"), rs.getString("c_tel"));

				BloodBank bb = new BloodBank(rs.getString("bank_id"), rs.getString("bk_name"), rs.getString("bk_addr"),
						rs.getString("bk_tel"));

			
				KeepBlood kb = new KeepBlood(rs.getString("blood_key"), bh, bb, rs.getString("st_date"),
						rs.getString("end_date"), rs.getString("dis_comment"), rs.getString("status"));

				KbListB.add(kb);

			}
			rs.close();
			pstmt.close();

			con.commit();
		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				showErr(e1);
			}
		}
		return KbListB;
	}

	public void adminBloodTrash() {
		PreparedStatement pstmt1 = null;
		PreparedStatement pstmt2 = null;

//         String sql1 = "UPDATE blood_keep SET dis_comment = '폐기' WHERE st_date + 35 <= sysdate and (dis_comment is null or dis_comment ='폐기예정')";
//           String sql2 = "UPDATE blood_keep SET dis_comment = '폐기예정' WHERE end_date + 7 <= sysdate and dis_comment is null";
		String sql1 = "UPDATE blood_keep SET status = '폐기' where (status is null or status ='폐기예정')\r\n"
				+ "    and to_date(end_date,'YY/MM/DD')<to_date(sysdate,'YY/MM/DD')";
		String sql2 = "UPDATE blood_keep SET status = '폐기예정' WHERE status is null and\r\n"
				+ "    to_date(end_date,'YY/MM/DD')>=to_date(sysdate,'YY/MM/DD') and\r\n"
				+ "    to_date(end_date,'YY/MM/DD')<= to_date(sysdate,'YY/MM/DD')+7";

		try {
			pstmt1 = con.prepareStatement(sql1);
			int count1 = pstmt1.executeUpdate();
			pstmt1.close();

			pstmt2 = con.prepareStatement(sql2);
			int count2 = pstmt2.executeUpdate();
			pstmt2.close();

			con.commit();

			System.out.println("✅ 폐기 처리된 혈액 수: " + count1);
			System.out.println("⚠️ 폐기 예정된 혈액 수: " + count2);

		} catch (SQLException e) {

			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				showErr(e1);
			}
		}
	}
	

//   한이----------------------------------------------------------------------------

	// 헌혈의 집 목록 출력
	public List<BloodCenter> showBloodCenter() {
		List<BloodCenter> list = new ArrayList<>();
		PreparedStatement pstmt = null;
		String sql = "select * from blood_center";

		try {
			pstmt = con.prepareStatement(sql);
			rs = pstmt.executeQuery();
			while (rs.next()) {
				list.add(new BloodCenter(rs.getString("center_id"), rs.getString("c_name"), rs.getString("c_address"),
						rs.getString("c_tel")));
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			showErr(e);
		}
		return list;
	}

	// 예약코드 자동갱신
	public String getNextBookingId() {
		String sql = "select max(to_number(substr(booking_id, 4))) as max_id from blood_booking";
		try (Statement stmt = con.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
			if (rs.next()) {
				int next = rs.getInt("max_id") + 1;
				return "BO-" + next;
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return "BO-1"; // 최초값
	}

	// 보관된 혈액코드 자동갱신
	public String getNextBloodKey() {
		String sql = "select max(to_number(substr(blood_key, 7))) as max_id from blood_keep";
		try (Statement stmt = con.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
			if (rs.next()) {
				int next = rs.getInt("max_id") + 1;
				return "B_KEY-" + next;
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return "B_KEY-1"; // 최초값
	}

	// 헌혈 예약 (헌혈의집 선택, 전자문진 검사, 기념품 선택)
	public String tryDonation(String centerId, String donorId, String donationType, int bloodVolume, String bookDate,
			String interview, String gift) {
		PreparedStatement pstmt = null;
		String sql = "insert into blood_booking values (?,?,?,?,?,to_date(?),?,?)";

		String bookingId = getNextBookingId();
		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, bookingId); // 예약 id (자동 증가)
			pstmt.setString(2, centerId); // 헌혈의집 id
			pstmt.setString(3, donorId); // 기부자 id
			pstmt.setString(4, donationType); // 헌혈종류 (전혈, 혈소판 등)
			pstmt.setInt(5, bloodVolume); // 혈액량 400ml
			pstmt.setString(6, bookDate); // 예약일자
			pstmt.setString(7, interview); // 문진결과 (헌혈가능 / 불가능)
			pstmt.setString(8, gift); // 사은품 목록 중 1택
			pstmt.executeUpdate();
			pstmt.close();
			con.commit();
			return bookingId;

		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
				System.out.println("데이터 삽입 실패!");
			}
		}
		return null;

	}

	// 예약 후 혈액 보관
	public void addBloodKeep(String bookingId, String centerId, String bankId, String stDate, String disComment) {
		PreparedStatement pstmt = null;
		String sql = "insert into blood_keep "
				+ "values (?, ?, ?, ?, to_date(?, 'YYYY-MM-DD'), to_date(?, 'YYYY-MM-DD') + 35, ?, null, null)";

		String bloodKey = getNextBloodKey();
		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, bloodKey); // 혈액관리번호
			pstmt.setString(2, bookingId); // 예약번호
			pstmt.setString(3, centerId); // 지점코드
			pstmt.setString(4, bankId); // 은행코드
			pstmt.setString(5, stDate); // 보관일자
			pstmt.setString(6, stDate); // for 만료일자
			pstmt.setString(7, disComment);
			pstmt.executeUpdate();
			pstmt.close();
			con.commit();

		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
				System.out.println("데이터 삽입 실패!");
			}
		}
	}

	// 헌혈자 ID 검증 메소드
	public boolean findDonorId(String donorId) {
		PreparedStatement pstmt = null;
		String sql = "select count(*) from blood_donor where donor_id = ?";

		try {
			pstmt = con.prepareStatement(sql);
			pstmt.setString(1, donorId);
			ResultSet rs = pstmt.executeQuery();
			if (rs.next()) {
				return rs.getInt(1) > 0;
			}
			pstmt.executeUpdate();
			pstmt.close();
			con.commit();

		} catch (SQLException e) {
			showErr(e);
			try {
				con.rollback();
			} catch (SQLException e1) {
				e1.printStackTrace();
				System.out.println("데이터 삽입 실패!");
			}
		}
		return false;
	}

//-------------------------------------수경 시작-------------------------------
	// donor_id 자동생성
	public String getdid() {
		String did = null;
		PreparedStatement pstmt = null;
//      String sql = "select donor_id from blood_donor order by to_number(substr(donor_id,4)) desc";

      String sql = " SELECT donor_id FROM (SELECT donor_id FROM blood_donor order by to_number(substr(donor_id,4)) desc)\r\n"
            + "    WHERE ROWNUM= 1";
      try {
         pstmt = con.prepareStatement(sql);
         rs = pstmt.executeQuery(sql);
         rs.next();
         did = rs.getString("DONOR_ID");
         /*
          * while (rs.next()) {
          * 
          * break; }
          */
         rs.close();
         pstmt.close();
      } catch (SQLException e) {
         showErr(e);
      }

      if (did == null) {
         did = "DN-1";
      } else {
         String[] arr = did.split("-");
         int n = Integer.parseInt(arr[1]);
         did = "DN-" + (n + 1);
      }
      return did;
   }
  
   //DONEE ID KEY 만들기
   public String getDoneeId() {
	      String did2 = null;
	      PreparedStatement pstmt = null;
	      String sql = " SELECT donee_id FROM (SELECT donee_id FROM blood_donee order by to_number(substr(donee_id,4)) desc)\r\n"
	            + "    WHERE ROWNUM= 1";
	      try {
	         pstmt = con.prepareStatement(sql);
	         rs = pstmt.executeQuery(sql);
	         rs.next();
	         did2 = rs.getString("DONEE_ID");
	       
	         rs.close();
	         pstmt.close();
	      } catch (SQLException e) {
	         showErr(e);
	      }

	      if (did2 == null) {
	         did2 = "DE-1";
	      } else {
	         String[] arr = did2.split("-");
	         int n = Integer.parseInt(arr[1]);
	         did2 = "DE-" + (n + 1);
	      }
	      return did2;
	   }
   
   //수혈 예약 pkey 만들기
   public String getDoneeBookingId() {
	      String did3 = null;
	      PreparedStatement pstmt = null;
	      String sql = "select de_booking_id from donee_booking order by to_number(substr(de_booking_id, 7)) desc";
	      try {
	         pstmt = con.prepareStatement(sql);
	         rs = pstmt.executeQuery(sql);
	         rs.next();
	         did3 = rs.getString("de_booking_id");
	       
	         rs.close();
	         pstmt.close();
	      } catch (SQLException e) {
	         showErr(e);
	      }

	      if (did3 == null) {
	         did3 = "DE_BO-1";
	      } else {
	         String[] arr = did3.split("-");
	         int n = Integer.parseInt(arr[1]);
	         did3 = "DE_BO-" + (n + 1);
	      }
	      return did3;
	   }

   public void insertDonor(Donor don) {

      PreparedStatement pstmt = null;
      String sql = "insert into blood_donor values (?,?,?,?,?,?,?)";

      try {
         pstmt = con.prepareStatement(sql);
         pstmt.setString(1, don.getDoId());
         pstmt.setString(2, don.getDoName());
         pstmt.setString(3, don.getDoRNum()); // 주민번호
         pstmt.setString(4, don.getDoGen());
         pstmt.setString(5, don.getDoAddr());
         pstmt.setString(6, don.getDoTel());
         pstmt.setString(7, don.getDoBloodType());
         pstmt.executeUpdate();
         con.commit();
         //System.out.println("데이터 입력 성공!");
         pstmt.close();

      } catch (SQLException e) {
         showErr(e);
         try {
            con.rollback();
         } catch (SQLException e1) {
            showErr(e1);
         }
      }

   }
   
   public void insertDonee(BloodDonee de) {

	      PreparedStatement pstmt = null;
	      String sql = "insert into blood_donee values (?,?,?,?,?,?,?)";

	      try {
	         pstmt = con.prepareStatement(sql);
	         pstmt.setString(1, de.getDoneeId());
	         pstmt.setString(2, de.getDeeName()); // 주민번호
	         pstmt.setString(3, de.getDeeRrnumber());
	         pstmt.setString(4, de.getDeeGender());
	         pstmt.setString(5, de.getDeeAddress());
	         pstmt.setString(6, de.getDeeTel());
	         pstmt.setString(7, de.getDeeBloodtype());
	         pstmt.executeUpdate();
	         con.commit();
	         //System.out.println("데이터 입력 성공!");
	         pstmt.close();

	      } catch (SQLException e) {
	         showErr(e);
	         try {
	            con.rollback();
	         } catch (SQLException e1) {
	            showErr(e1);
	         }
	      }

	   }
   
   //수혈부킹
   public void insertDoneeBooking(DoneeBooking bk) {
	   PreparedStatement pstmt = null;
	      String sql = "insert into donee_booking values (?,?,?,?,?,?)";

	      try {
	         pstmt = con.prepareStatement(sql);
	         pstmt.setString(1, bk.getDe_booking_id());	//수혈번호
	         pstmt.setString(2, bk.getDonee_id()); 		//수혈자코드
	         pstmt.setString(3, bk.getBank_id());		//은행코드
	         pstmt.setString(4, bk.getDe_donation());	//헌혈종류
	         pstmt.setInt(5, bk.getDe_bloodvolume());//수혈량
	         pstmt.setString(6, bk.getDe_booktime());	//예약시간
	         pstmt.executeUpdate();
	         con.commit();
	         //System.out.println("데이터 입력 성공!");
	         pstmt.close();

	      } catch (SQLException e) {
	         showErr(e);
	         try {
	            con.rollback();
	         } catch (SQLException e1) {
	            showErr(e1);
	         }
	      } 
   }
   
   //keep에 수혈자 넣기 (UPDATE)
   public void updateKeepDonee(String DoneeId, String Blood_key) { 
	   PreparedStatement pstmt = null;
      
       String sql = "UPDATE blood_keep\r\n"
       		+ "SET status = '사용됨',\r\n"
       		+ "    dis_comment = (SELECT de_booktime \r\n"
       		+ "                   FROM donee_booking \r\n"
       		+ "                   WHERE donee_id = ? AND ROWNUM = 1),\r\n"
       		+ "    de_booking_id = (SELECT de_booking_id \r\n"
       		+ "                     FROM donee_booking \r\n"
       		+ "                     WHERE donee_id = ? AND ROWNUM = 1)\r\n"
       		+ "WHERE blood_key = ?";


       try {
    	   pstmt = con.prepareStatement(sql);
	         pstmt.setString(1, DoneeId);	//수혈번호
	         pstmt.setString(2, DoneeId); 		//수혈자코드
	         pstmt.setString(3, Blood_key);		
	         pstmt.executeUpdate();
	         con.commit();
	         System.out.println("데이터 입력 성공!");
	         pstmt.close();
       } catch (SQLException e) {
      	 
          showErr(e);
          try {
             con.rollback();
          } catch (SQLException e1) {
             showErr(e1);
          }
       }
    }
 
   //keep에 수혈자 넣기 (변경할 blood key 찾기)
   public ArrayList<String> getDoneeBloodSK(String DoneeId) {
	   	PreparedStatement pstmt1 = null;
	   	PreparedStatement pstmt2 = null;
	   	PreparedStatement pstmt3 = null;

	   	String bloodtype = null;
	   	Date deBooktime = null;
	   	String deDonationType = null;
	   	String keepBloodId = null;
	   	ArrayList<String> keepId = new ArrayList<String>();
	   	
		String sql1 = "select DEE_BLOODTYPE from blood_donee where DONEE_ID = ? ";
		String sql2 = "select DE_BOOKTIME,DE_DONATIONTYPE from donee_booking where DONEE_ID = ? ";
		String sql3 = "select 혈액관리번호 from blood_all where 혈액형 = ? \r\n"
				+ "    and to_date(보관일자,'YY/MM/DD')<to_date(?,'YY/MM/DD') \r\n"
				+ "    and to_date(?,'YY/MM/DD')<=to_date(만료일자,'YY/MM/DD') \r\n"
				+ "    and 헌혈종류 = ? order by 만료일자 asc ";
		 try {
	    	   pstmt1 = con.prepareStatement(sql1);
		       pstmt1.setString(1, DoneeId);	//혈액형 찾을 수혈자코드
		       rs = pstmt1.executeQuery();
		       if(rs.next()) {
		    	   bloodtype = rs.getString("DEE_BLOODTYPE");
		       }
		       rs.close();
		       pstmt1.close();
		       
		       pstmt2 = con.prepareStatement(sql2);
		       pstmt2.setString(1, DoneeId);	//예약시간, 수혈종류 찾을 수혈자코드
		       rs = pstmt2.executeQuery();
		       if(rs.next()) {
		    	   deBooktime = rs.getDate("DE_BOOKTIME");
			       deDonationType = rs.getString("DE_DONATIONTYPE");
		       }
		       rs.close();
		       pstmt2.close();

		       pstmt3 = con.prepareStatement(sql3);
		       pstmt3.setString(1, bloodtype);
		       pstmt3.setDate(2, deBooktime);	
		       pstmt3.setDate(3, deBooktime);	
		       pstmt3.setString(4, deDonationType);	
		       rs = pstmt3.executeQuery();
		       
		       while(rs.next()) {
		    	   keepBloodId = rs.getString("혈액관리번호");
			       keepId.add(keepBloodId);
		       }
		
		       rs.close();
		       pstmt3.close();
	       } catch (SQLException e) {
	          showErr(e);
	          System.out.println("수혈량이 부족합니다.");
	       }
		 	
		 return keepId;
		
	}
   
   
   
   //--------------------------------가상테이블 사용 예시 시작-------------------
   public void showbloodkeep() {
      String sql = "select 혈액형, 헌혈종류, 헌혈량, 보관일자, 만료일자, 폐기사유 from blood_all" ;
            
         try {
            st = con.createStatement();
            rs = st.executeQuery(sql);
            int i = 1;
            while (rs.next() ) {
               System.out.println("번호:"+ (i++));
               System.out.println(
                     "혈액형: " + rs.getString("혈액형") + "\n" +
                     "헌혈종류: " + rs.getString("헌혈종류") + "\n" +
                     "헌혈량: " + rs.getString("헌혈량") + "\n" +
                     "보관일자: " + rs.getString("보관일자") + "\n" +
                     "만료일자: " + rs.getString("만료일자") + "\n" +
                     "폐기사유: " + rs.getString("폐기사유") 
                     );
               
               System.out.println("----------------------------");            
            }
            rs.close();
         } catch (SQLException e) {
            showErr(e);
         }      
   }

   //--------------------------------가상테이블 사용 예시 끝-------------------
   
   public void showAvailableBlood() {
	   String sql = "select 혈액형, 헌혈종류, sum(헌혈량) from blood_all \r\n"
	   		+ "   where to_date(만료일자,'YY/MM/DD')between to_date(sysdate,'YY/MM/DD') \r\n"
	   		+ "   and (to_date(sysdate,'YY/MM/DD')+35) \r\n"
	   		+ "   and 상태 is null or 상태 = '폐기예정' group by 혈액형, 헌혈종류 order by 혈액형";
	   
	     try {
	           st = con.createStatement();
	           rs = st.executeQuery(sql);
	           while (rs.next() ) {
	              System.out.println(
	                     "혈액형: " + rs.getString("혈액형") + "\n" +
	                     "혈액종류: " + rs.getString("헌혈종류") + "\n" +
	                     "혈액량: " + rs.getString("sum(헌혈량)") + "ml"
	                     );
	               
	               System.out.println("----------------------------");            
	            }
	            rs.close();
	         } catch (SQLException e) {
	            showErr(e);
	         } 
   }
   
   
   
   
   
   //랜덤부킹인서트
   public void RandBookingFull(String bookingiId, String centerId, String donorId, String donationType, int bloodVolume, String bookDate,
         String interview, String gift) {
      PreparedStatement pstmt = null;
      String sql = "insert into blood_booking values (?,?,?,?,?,to_date(?),?,?)";

      //String bookingId = getNextBookingId();
      try {
         pstmt = con.prepareStatement(sql);
         pstmt.setString(1, bookingiId); // 예약 id (자동 증가)
         pstmt.setString(2, centerId); // 헌혈의집 id
         pstmt.setString(3, donorId); // 기부자 id
         pstmt.setString(4, donationType); // 헌혈종류 (전혈, 혈소판 등)
         pstmt.setInt(5, bloodVolume); // 혈액량 400ml
         pstmt.setString(6, bookDate); // 예약일자
         pstmt.setString(7, interview); // 문진결과 (헌혈가능 / 불가능)
         pstmt.setString(8, gift); // 사은품 목록 중 1택
         pstmt.executeUpdate();
         pstmt.close();

         con.commit();

      } catch (SQLException e) {
         showErr(e);
         try {
            con.rollback();
         } catch (SQLException e1) {
            e1.printStackTrace();
            System.out.println("데이터 삽입 실패!");
         }
      }
   }
   
   //연습 안쓸예정
   public String dateBetween(String doid, String donatype, String booktime) {
          int betDate = 0;
          if (donatype == "전혈") {
            betDate=56;
         }
          else if(donatype == "혈소판 성분헌혈" || donatype=="혈장 성분헌혈") {
             betDate=14;
          }
           
         String dateCount = null;
         PreparedStatement pstmt = null;
         String sql = String.format("select count(*) as cnt from blood_booking bo, blood_donor do \r\n"
               + "    where do.donor_id = bo.donor_id and do.donor_id = '%S' \r\n"
               + "    and bo.bo_booktime between to_date('%s','YY/MM/DD')-%d AND to_date('%s','YY/MM/DD')+%d", doid,booktime,betDate,booktime,betDate);
         try {
            pstmt = con.prepareStatement(sql);
            rs = pstmt.executeQuery(sql);
            rs.next();
            dateCount = rs.getString("cnt");
            
            rs.close();
            pstmt.close();
         } catch (SQLException e) {
            showErr(e);
         }

         return dateCount;
      }
   
   //BloodBank 객체?생성?
   public BloodBank getBloodBank() {
      BloodBank bk = null;
      String sql = "select * from blood_bank";

      try {
         st = con.createStatement();
         rs = st.executeQuery(sql);
         while (rs.next() ) {
            bk = new BloodBank(rs.getString("bank_id"), 
                  rs.getString("bk_name"),
                  rs.getString("bk_addr"),
                  rs.getString("bk_tel"));

         }
         rs.close();
      } catch (SQLException e) {
         showErr(e);
      }      
      return bk;
   }
   
	
//-------------------------------------수경 끝-------------------------------

}
