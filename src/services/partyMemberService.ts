export interface Profile {
  id: number;
  name: string;
  unit: string;
  introducer: string;
  startDate: string;
  status: string;
  progress: number;
  statusText: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  education?: string;
  position?: string;
  notes?: string;
  joinDate?: string;
  decisionNumber?: string;
  history?: Array<{
    step: string;
    date: string;
    note: string;
  }>;
}

export interface PartyMember {
  id: number;
  name: string;
  unit: string;
  joinDate: string;
  status: "probationary" | "official";
  type: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  education?: string;
  position?: string;
  partyAge?: number;
  introducer?: string;
  decisionNumber?: string;
  probationEndDate?: string;
  history?: Array<{
    date: string;
    activity: string;
    note: string;
  }>;
  developmentHistory?: Array<{
    step: string;
    date: string;
    note: string;
  }>;
}

class PartyMemberService {
  /**
   * Chuyển đổi hồ sơ phát triển sang đảng viên dự bị
   */
  convertProfileToMember(profile: Profile): PartyMember {
    const joinDate = new Date(profile.joinDate || new Date());
    const probationEndDate = new Date(joinDate);
    probationEndDate.setMonth(probationEndDate.getMonth() + 12);

    const now = new Date();
    const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                       (now.getMonth() - joinDate.getMonth());
    const partyAge = Math.max(0, Math.floor(monthsDiff / 12));

    return {
      id: this.generateMemberId(),
      name: profile.name,
      unit: profile.unit,
      joinDate: this.formatDate(joinDate),
      status: "probationary",
      type: "Đảng viên dự bị",
      phone: profile.phone,
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      address: profile.address,
      education: profile.education,
      position: profile.position,
      partyAge: partyAge,
      introducer: profile.introducer,
      decisionNumber: profile.decisionNumber,
      probationEndDate: this.formatDate(probationEndDate),
      history: [
        {
          date: this.formatDate(joinDate),
          activity: "Kết nạp đảng viên dự bị",
          note: `Chuyển đổi từ hồ sơ phát triển #${profile.id}. ${profile.notes || ''}`,
        },
      ],
      developmentHistory: profile.history,
    };
  }

  private generateMemberId(): number {
    const members = this.getAllMembers();
    if (members.length === 0) return 1;
    return Math.max(...members.map(m => m.id)) + 1;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  saveMember(member: PartyMember): void {
    const members = this.getAllMembers();
    members.push(member);
    localStorage.setItem('partyMembers', JSON.stringify(members));
  }

  getAllMembers(): PartyMember[] {
    const data = localStorage.getItem('partyMembers');
    return data ? JSON.parse(data) : [];
  }

  isProfileConverted(profileId: number): boolean {
    const members = this.getAllMembers();
    return members.some(m => 
      m.developmentHistory && 
      m.history?.some(h => h.note.includes(`#${profileId}`))
    );
  }

  checkProbationDeadline(member: PartyMember): boolean {
    if (!member.probationEndDate || member.status !== 'probationary') {
      return false;
    }

    const endDate = this.parseDate(member.probationEndDate);
    const now = new Date();
    const daysUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilEnd <= 30 && daysUntilEnd >= 0;
  }

  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  convertToOfficialMember(memberId: number, decisionNumber: string, note: string): boolean {
    const members = this.getAllMembers();
    const index = members.findIndex(m => m.id === memberId);
    
    if (index === -1) return false;

    const member = members[index];
    
    member.status = "official";
    member.type = "Đảng viên chính thức";
    member.decisionNumber = decisionNumber;
    
    const now = new Date();
    member.history = member.history || [];
    member.history.push({
      date: this.formatDate(now),
      activity: "Chuyển đảng viên chính thức",
      note: note,
    });

    if (member.joinDate) {
      const joinDate = this.parseDate(member.joinDate);
      const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                         (now.getMonth() - joinDate.getMonth());
      member.partyAge = Math.floor(monthsDiff / 12);
    }

    members[index] = member;
    localStorage.setItem('partyMembers', JSON.stringify(members));
    
    return true;
  }
}

export const partyMemberService = new PartyMemberService();